// supabase/functions/process-payout/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PROVIDER_MAP: Record<string, string> = {
  MPESA: "m_pesa",
  ORANGE: "orange_money",
  AIRTEL: "airtel_money",
  m_pesa: "m_pesa",
  orange_money: "orange_money",
  airtel_money: "airtel_money",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ─── 1. Authenticate and check lecturer role ─────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: `Authentication failed: ${userError?.message || "Invalid session"}` }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const user = userData.user;

    // Use admin client (bypassing RLS) to check profiles and verify role
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "lecturer") {
      return new Response(
        JSON.stringify({ error: "Accès interdit : Seuls les enseignants peuvent demander des retraits." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── 2. Parse and validate body ──────────────────────────────────────────
    const { amountUsd, provider, destinationPhone } = await req.json();

    const amt = parseFloat(amountUsd);
    if (isNaN(amt) || amt <= 0) {
      return new Response(
        JSON.stringify({ error: "Montant invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dbProvider = PROVIDER_MAP[provider];
    if (!dbProvider) {
      return new Response(
        JSON.stringify({ error: `Opérateur non supporté: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!destinationPhone || destinationPhone.length < 9) {
      return new Response(
        JSON.stringify({ error: "Numéro de téléphone cible invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── 3. Calculate current balance on server to prevent fraud ─────────────
    // A. Gross Lifetime Earnings
    const { data: courses, error: coursesError } = await adminClient
      .from("courses")
      .select(`id, purchases(lecturer_share_usd, status)`)
      .eq("lecturer_id", user.id);

    if (coursesError) {
      console.error("Balance check error (courses):", coursesError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la vérification du solde." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let grossEarnings = 0;
    courses?.forEach((c) => {
      c.purchases?.forEach((p) => {
        if (p.status === "completed") {
          grossEarnings += Number(p.lecturer_share_usd);
        }
      });
    });

    // B. Total Payouts Already Deducted
    const { data: payouts, error: payoutsError } = await adminClient
      .from("lecturer_payouts")
      .select("amount_usd")
      .eq("lecturer_id", user.id)
      .in("status", ["completed", "requested"]);

    if (payoutsError) {
      console.error("Balance check error (payouts):", payoutsError);
      return new Response(
        JSON.stringify({ error: "Erreur lors du calcul des retraits." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let totalWithdrawn = 0;
    payouts?.forEach((po) => {
      totalWithdrawn += Number(po.amount_usd);
    });

    const availableBalance = Number((grossEarnings - totalWithdrawn).toFixed(2));

    if (amt > availableBalance) {
      return new Response(
        JSON.stringify({ error: `Solde insuffisant. Votre solde disponible est de $${availableBalance}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── 4. Call Malipo Payout/Transfer API ──────────────────────────────────
    const malipoSecretKey = Deno.env.get("MALIPO_SECRET_KEY");
    if (!malipoSecretKey) {
      console.error("MALIPO_SECRET_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Configuration serveur incomplète: fournisseur de paiement indisponible" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // We execute the payout via Malipo.
    // Malipo uses VODACOM_MPESA, ORANGE_MONEY, AIRTEL_MONEY.
    const malipoNetworkMap: Record<string, string> = {
      m_pesa: "VODACOM_MPESA",
      orange_money: "ORANGE_MONEY",
      airtel_money: "AIRTEL_MONEY",
    };

    const malipoRes = await fetch("https://api.malipo.dev/v1/transfers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${malipoSecretKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `PO_${Date.now()}_${user.id.slice(0, 5)}`,
      },
      body: JSON.stringify({
        amount: amt, // transfer amount in USD
        currency: "USD",
        phone: destinationPhone,
        network: malipoNetworkMap[dbProvider],
        description: `Disbursement Enseignant ID: ${user.id}`,
      }),
    });

    const malipoData = await malipoRes.json();

    if (!malipoRes.ok) {
      console.error("Malipo payout transfer failed:", malipoData);
      return new Response(
        JSON.stringify({ error: malipoData.message || "Le transfert Malipo a été refusé par l'opérateur." }),
        { status: malipoRes.status || 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── 5. Record the payout as completed in database ──────────────────────
    const { error: payoutInsertError } = await adminClient
      .from("lecturer_payouts")
      .insert({
        lecturer_id: user.id,
        amount_usd: amt,
        provider: dbProvider,
        destination_phone: destinationPhone,
        status: "completed",
        processed_at: new Date().toISOString(),
      });

    if (payoutInsertError) {
      console.error("Payout inserted fail:", payoutInsertError);
      return new Response(
        JSON.stringify({ error: `Transfert réussi via Malipo mais échec d'enregistrement en base de données. Contactez le support.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Votre retrait a été traité avec succès et envoyé sur votre compte Mobile Money.",
        availableBalance: Number((availableBalance - amt).toFixed(2)),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("process-payout error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
