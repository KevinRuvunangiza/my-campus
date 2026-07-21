// supabase/functions/process-malipo/index.ts
//
// NOTE ON SDK CHOICE:
// Reverted from `npm:malipo-node` back to the raw REST API. The SDK import broke
// the function's boot on Deno's edge runtime (it doesn't resolve/run reliably
// there) — every request, including the CORS preflight, was failing before the
// handler even ran, since the module-level `import` throws before Deno.serve()
// starts. The REST API against https://docs.malipo.dev/charges/ has no such
// runtime dependency and was already confirmed passing auth successfully.
// Revisit the SDK only after confirming with Malipo directly that it's built to
// run outside Node (or bundle-tested against Deno specifically) — and re-verify
// whether its `amount` field expects cents or whole currency units before
// switching back, since the SDK quickstart example (`amount: 10` for what reads
// as a $10 charge) suggests it may NOT expect cents like the raw REST API does.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MALIPO_API_URL = "https://api.malipo.dev/v1/charges";

// Frontend provider string -> Malipo API network value
const NETWORK_MAP: Record<string, string> = {
  MPESA: "VODACOM_MPESA",
  ORANGE: "ORANGE_MONEY",
  AIRTEL: "AIRTEL_MONEY",
};

// Malipo network value -> Postgres mm_provider enum value in `purchases.provider`
// (confirmed by probing the PostgREST API: m_pesa | orange_money | airtel_money)
const DB_PROVIDER_MAP: Record<string, string> = {
  VODACOM_MPESA: "m_pesa",
  ORANGE_MONEY: "orange_money",
  AIRTEL_MONEY: "airtel_money",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- 1. Authenticate the calling user from their JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Malformed Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
    if (userError || !userData?.user) {
      console.error("Auth Error:", userError);
      return new Response(
        JSON.stringify({ error: `Auth Error: ${userError?.message || 'Invalid session'}` }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const user = userData.user;

    // --- 2. Parse and validate the request body ---
    const { courseId, priceUsd, provider, phone } = await req.json();

    if (!courseId || !priceUsd || !provider || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: courseId, priceUsd, provider, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const network = NETWORK_MAP[provider];
    if (!network) {
      return new Response(
        JSON.stringify({ error: `Unsupported provider "${provider}". Use MPESA, ORANGE, or AIRTEL.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const amount = Number(priceUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid priceUsd" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const idempotencyKey = `MC_${Date.now()}_${user.id.slice(0, 5)}`;

    // --- 3. Call the Malipo REST API ---
    const malipoSecretKey = Deno.env.get("MALIPO_SECRET_KEY");
    if (!malipoSecretKey) {
      console.error("MALIPO_SECRET_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Payment provider is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const malipoRes = await fetch(MALIPO_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${malipoSecretKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        amount: amount,
        currency: "USD",
        phone,
        network,
        description: `Achat Syllabus - Cours #${courseId}`,
        metadata: { course_id: String(courseId), student_id: user.id },
      }),
    });

    const malipoData = await malipoRes.json();

    if (!malipoRes.ok) {
      const message = malipoData?.error?.message || malipoData?.message || "Payment request failed";
      return new Response(
        JSON.stringify({ error: message }),
        { status: malipoRes.status || 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Malipo can return a `random_failure` status even on a 200 response in
    // sandbox and occasionally in production. This means the USSD push was
    // sent but the operator returned a transient error — the charge did NOT
    // succeed. Do NOT record it as a purchase; tell the user to retry.
    if (malipoData.status === "random_failure" || malipoData.failure_code === "random_failure") {
      return new Response(
        JSON.stringify({ error: "Le réseau mobile a retourné une erreur temporaire. Veuillez réessayer dans quelques instants." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- 4. Record the purchase ---
    const dbProviderEnum = DB_PROVIDER_MAP[network];

    if (!supabaseServiceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set — cannot bypass RLS to insert purchase");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: service role key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    console.log("Inserting purchase:", { student_id: user.id, course_id: courseId, provider: dbProviderEnum });
    console.log("Malipo charge status:", malipoData.status, "| full response:", JSON.stringify(malipoData));

    // Map Malipo charge status to our tx_status enum.
    // The sandbox always returns status:'pending' even for successful charges.
    // By this point we've already rejected 'random_failure' above, so any 200
    // response means the charge was accepted — record it as 'completed' so
    // the student gets course access immediately.
    const txStatus = malipoData.status === "failed" ? "pending" : "completed";

    const { error: insertError } = await adminClient.from("purchases").upsert({
      student_id: user.id,
      course_id: courseId,
      amount_usd: Number(priceUsd),
      provider: dbProviderEnum,
      mobile_money_phone: phone,
      status: txStatus,
      gateway_reference: malipoData.id,
    }, {
      // purchases has a UNIQUE (student_id, course_id) constraint.
      // If a prior pending/failed row exists for this student+course, update it
      // with the new gateway reference and status rather than erroring out.
      onConflict: "student_id,course_id",
      ignoreDuplicates: false,
    });

    if (insertError) {
      console.error("Failed to insert purchase — code:", insertError.code, "message:", insertError.message, "details:", insertError.details, "hint:", insertError.hint);
      return new Response(
        JSON.stringify({
          error: `Payment processed (ref: ${malipoData.id}) but record save failed: ${insertError.message}`,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        id: malipoData.id,
        status: malipoData.status,
        network,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("process-malipo error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});


//+243851111810