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

// Malipo network value -> Postgres enum value in `purchases.provider`
const DB_PROVIDER_MAP: Record<string, string> = {
  VODACOM_MPESA: "vodacom_mpesa",
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

    // Malipo expects amount in the SMALLEST currency unit (cents for USD),
    // per https://docs.malipo.dev/charges/
    const amountInCents = Math.round(Number(priceUsd) * 100);
    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
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
        amount: amountInCents,
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

    // --- 4. Record the purchase ---
    const dbProviderEnum = DB_PROVIDER_MAP[network];
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error: insertError } = await adminClient.from("purchases").insert({
      student_id: user.id,
      course_id: courseId,
      amount_usd: Number(priceUsd),
      provider: dbProviderEnum,
      mobile_money_phone: phone,
      status: malipoData.status === "succeeded" ? "completed" : "pending",
      gateway_reference: malipoData.id,
    });

    if (insertError) {
      console.error("Failed to insert purchase:", insertError);
      return new Response(
        JSON.stringify({
          error: "Payment was initiated but we couldn't save the record. Contact support with reference " + malipoData.id,
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