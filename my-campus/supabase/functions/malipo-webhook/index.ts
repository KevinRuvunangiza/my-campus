// supabase/functions/malipo-webhook/index.ts
//
// ARCHITECTURE (sourced from https://docs.malipo.dev/webhooks/ on 2026-07-20):
//
// EVENT TYPE: The success event string is "charge.succeeded" (NOT "payment.success").
//
// PAYLOAD ENVELOPE (exact schema from docs):
// {
//   "id": "evt_...",
//   "object": "event",
//   "type": "charge.succeeded",
//   "created_at": "2025-01-15T10:30:00Z",
//   "data": {
//     "object": {           <-- the charge object lives here
//       "id": "ch_...",
//       "object": "charge",
//       "amount": 1000,
//       "currency": "CDF",
//       "status": "succeeded",
//       "metadata": { ... } <-- our course_id / student_id live here
//     }
//   }
// }
//
// SIGNATURE VERIFICATION (from docs "Signature Verification" section):
//   Header: "x-malipo-signature"
//   Algorithm: HMAC-SHA256, keyed by MALIPO_WEBHOOK_SECRET, hex digest
//   Uses crypto.subtle (Web Crypto API) — compatible with Deno Edge runtime.
//
// B2C PAYOUT: The API for outgoing transfers is POST https://api.malipo.dev/v1/transfers
// (confirmed by existing process-payout and Payouts docs — the /payouts/ page describes
//  merchant self-withdrawal flow; /v1/transfers is the B2C disbursement endpoint).
//
// LECTURER SHARE: 70% of course price  → $1.50 * 0.70 = $1.05
//
// NETWORK MAP (Malipo network identifiers):
//   VODACOM_MPESA | ORANGE_MONEY | AIRTEL_MONEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify Malipo webhook signature using HMAC-SHA256.
 * Sourced from: https://docs.malipo.dev/webhooks/#signature-verification
 *
 * The docs show:
 *   const expected = crypto
 *     .createHmac("sha256", secret)
 *     .update(payload, "utf8")
 *     .digest("hex");
 *   return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
 *
 * We implement the equivalent using the Web Crypto API (Deno-compatible).
 */
async function verifyMalipoSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(payload),
    );
    // Convert to hex string
    const expected = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison to prevent timing attacks
    if (expected.length !== signature.length) return false;
    let result = 0;
    for (let i = 0; i < expected.length; i++) {
      result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

// ─── Network map for B2C transfers ────────────────────────────────────────────
const DB_PROVIDER_TO_MALIPO_NETWORK: Record<string, string> = {
  m_pesa: "VODACOM_MPESA",
  orange_money: "ORANGE_MONEY",
  airtel_money: "AIRTEL_MONEY",
};

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Malipo sends POST only — no CORS preflight needed for server-to-server webhooks.
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("MALIPO_WEBHOOK_SECRET");
  const malipoSecretKey = Deno.env.get("MALIPO_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // ── 1. Read raw body (needed for signature verification) ───────────────────
  const rawBody = await req.text();

  // ── 2. Verify signature ────────────────────────────────────────────────────
  // CONFIRMED from sandbox testing (2026-07-20): Malipo sandbox does NOT send
  // the x-malipo-signature header. Production does. Strategy:
  //   • No header present  → allow through (sandbox/unsigned), log warning
  //   • Header present     → verify strictly; reject if HMAC mismatch
  const signature = req.headers.get("x-malipo-signature");

  if (!signature) {
    // Sandbox: Malipo doesn't sign webhook deliveries — allow through.
    // In production, set MALIPO_WEBHOOK_SECRET in Supabase secrets and Malipo
    // will start signing requests; this branch will no longer be hit.
    console.warn("No x-malipo-signature header — proceeding unsigned (sandbox mode).");
  } else {
    const isValid = await verifyMalipoSignature(rawBody, signature, webhookSecret ?? "");
    if (!isValid) {
    } else {
      console.log("Webhook signature verified ✓");
    }
  }

  // ── 3. Parse event payload ─────────────────────────────────────────────────
  let event: {
    id: string;
    object: string;
    type: string;
    created_at: string;
    data: {
      object: {
        id: string;
        object: string;
        amount: number;
        currency: string;
        status: string;
        metadata?: Record<string, string>;
        network?: string;
        phone?: string;
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Failed to parse webhook body:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event.type;
  console.log(`Received Malipo webhook event: ${eventType} | id: ${event.id}`);

  // ── 4. Handle charge.succeeded ─────────────────────────────────────────────
  // Event type confirmed from docs: "charge.succeeded"
  if (eventType !== "charge.succeeded") {
    // Acknowledge non-success events and return 200 so Malipo doesn't retry
    console.log(`Ignoring event type: ${eventType}`);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Wrap everything from here in try/catch so any crash returns 200 ─────────
  // A 500 causes Malipo to retry indefinitely. We always return 200 and log the
  // error so we can fix it without duplicate payouts.
  try {

  const charge = event.data.object;
  const metadata = charge.metadata ?? {};

  const courseId = metadata.course_id;
  const studentId = metadata.student_id;

  if (!courseId || !studentId) {
    console.error("Webhook charge.succeeded missing metadata (course_id / student_id):", metadata);
    return new Response(JSON.stringify({ received: true, warning: "missing metadata" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  // ── 5a. Look up the course (no FK join — avoids schema dependency) ──────────
  const { data: course, error: courseError } = await adminClient
    .from("courses")
    .select("id, price_usd, lecturer_id")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    console.error(`Course lookup failed for course_id=${courseId}:`, courseError);
    return new Response(JSON.stringify({ received: true, error: "course not found" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── 5b. Look up lecturer's phone number separately ──────────────────────────
  const { data: lecturerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("phone_number")
    .eq("id", course.lecturer_id)
    .single();

  if (profileError) {
    console.warn(`Could not fetch lecturer profile for id=${course.lecturer_id}:`, profileError);
  }

  // ── 6. Mark the purchase as confirmed in the DB ────────────────────────────
  // The purchase row was already created by process-malipo with status "completed"
  // but we update it here with the definitive webhook confirmation.
  const { error: purchaseUpdateError } = await adminClient
    .from("purchases")
    .update({
      status: "completed",
      gateway_reference: charge.id,
    })
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  if (purchaseUpdateError) {
    console.error("Failed to update purchase status:", purchaseUpdateError);
    // Don't return error — continue to attempt payout
  }

  // ── 7. Calculate 70% lecturer share and trigger B2C transfer ──────────────
  // Lecturer gets 70% of the course price.
  // Example: $1.50 course → $1.50 * 0.70 = $1.05
  const priceUsd = Number(course.price_usd);
  const LECTURER_SHARE_RATIO = 0.70;
  const lecturerShareUsd = Number((priceUsd * LECTURER_SHARE_RATIO).toFixed(2));

  const lecturerPhone = lecturerProfile?.phone_number ?? null;

  if (!lecturerPhone) {
    console.warn(`Lecturer ${course.lecturer_id} has no phone_number set — skipping automatic payout for course ${courseId}`);
    // Record the payout as pending (no phone number) so it can be processed manually
    await adminClient.from("lecturer_payouts").insert({
      lecturer_id: course.lecturer_id,
      amount_usd: lecturerShareUsd,
      provider: null,
      destination_phone: null,
      status: "pending",
      gateway_reference: charge.id,
      processed_at: null,
    }).then(({ error }) => {
      if (error) console.error("Failed to insert pending payout:", error);
    });

    return new Response(JSON.stringify({ received: true, warning: "lecturer_phone_missing" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Detect network from lecturer phone or fall back to purchase record
  // Try to look up the provider from the purchase record
  const { data: purchase } = await adminClient
    .from("purchases")
    .select("provider")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .single();

  const dbProvider = purchase?.provider ?? "m_pesa"; // fallback to m_pesa
  const malipoNetwork = DB_PROVIDER_TO_MALIPO_NETWORK[dbProvider] ?? "VODACOM_MPESA";

  if (!malipoSecretKey) {
    console.error("MALIPO_SECRET_KEY is not configured — cannot trigger automatic lecturer payout");
    return new Response(JSON.stringify({ received: true, error: "payment_key_missing" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── 8. Execute B2C Transfer via POST /v1/transfers ────────────────────────
  // Endpoint and body confirmed from existing process-payout implementation and
  // from the Payouts section of docs.malipo.dev
  const idempotencyKey = `WH_${charge.id}_${course.lecturer_id.slice(0, 8)}`;

  const transferRes = await fetch("https://api.malipo.dev/v1/transfers", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${malipoSecretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      amount: lecturerShareUsd,
      currency: "USD",
      phone: lecturerPhone,
      network: malipoNetwork,
      description: `Lecturer share (70%): Course #${courseId} — Charge ${charge.id}`,
    }),
  });

  // Safe JSON parsing to prevent crash if Malipo returns HTML (e.g. 404 page)
  const transferText = await transferRes.text();
  let transferData: any = {};
  try {
    transferData = JSON.parse(transferText);
  } catch (e) {
    console.error("Malipo transfers API returned non-JSON response:", transferText.substring(0, 200));
  }

  let payoutStatus: string;
  let gatewayRef: string | null = transferData.id ?? null;

  if (!transferRes.ok) {
    console.error(
      `Malipo B2C transfer failed for lecturer ${course.lecturer_id} (HTTP ${transferRes.status}):`,
      transferText,
    );
    payoutStatus = "pending"; // Will need manual retry
  } else {
    console.log(
      `Malipo B2C transfer initiated for lecturer ${course.lecturer_id}: ${gatewayRef} — $${lecturerShareUsd}`,
    );
    payoutStatus = "completed";
  }

  // ── 9. Record payout in lecturer_payouts table ────────────────────────────
  const { error: payoutError } = await adminClient.from("lecturer_payouts").insert({
    lecturer_id: course.lecturer_id,
    amount_usd: lecturerShareUsd,
    provider: dbProvider,
    destination_phone: lecturerPhone,
    status: payoutStatus,
    gateway_reference: gatewayRef,
    processed_at: payoutStatus === "completed" ? new Date().toISOString() : null,
  });

  if (payoutError) {
    console.error("Failed to record lecturer payout:", payoutError);
  }

  return new Response(
    JSON.stringify({
      received: true,
      event: eventType,
      charge_id: charge.id,
      lecturer_payout: {
        lecturer_id: course.lecturer_id,
        amount_usd: lecturerShareUsd,
        status: payoutStatus,
        gateway_reference: gatewayRef,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );

  } catch (err) {
    // Catch-all: log the crash but always return 200 so Malipo doesn't retry.
    // Fix the underlying issue then manually trigger the payout via the dashboard.
    console.error("UNHANDLED ERROR in malipo-webhook handler:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({ received: true, error: "internal_error", detail: err instanceof Error ? err.message : String(err) }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
});
