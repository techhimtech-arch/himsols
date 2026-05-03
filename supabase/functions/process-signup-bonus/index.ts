import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate caller via JWT — never trust user_id from body
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user_id = userData.user.id;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const referral_code: string | null = body?.referral_code || null;

    console.log(`Processing signup bonus for user: ${user_id}, referral_code: ${referral_code || "none"}`);

    // Idempotency: skip if a welcome bonus has already been issued
    const { data: existingWelcome } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("user_id", user_id)
      .eq("source", "WELCOME_BONUS")
      .maybeSingle();

    if (existingWelcome) {
      return new Response(
        JSON.stringify({ success: true, already_processed: true, total_bonus: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch bonus settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["welcome_bonus_amount", "referral_bonus_referrer", "referral_bonus_referee", "referral_enabled"]);

    const settings: Record<string, string> = {};
    settingsData?.forEach((s: any) => {
      settings[s.key] = s.value || "0";
    });

    const welcomeBonus = parseFloat(settings.welcome_bonus_amount || "10");
    const referrerBonus = parseFloat(settings.referral_bonus_referrer || "25");
    const refereeBonus = parseFloat(settings.referral_bonus_referee || "15");
    const referralEnabled = settings.referral_enabled === "true";

    let totalBonusForNewUser = 0;
    let referrerUserId: string | null = null;

    if (welcomeBonus > 0) {
      const { error: welcomeError } = await supabase.rpc("wallet_transaction", {
        p_user_id: user_id,
        p_type: "CREDIT",
        p_amount: welcomeBonus,
        p_source: "WELCOME_BONUS",
        p_description: "Welcome bonus for joining Himsols! 🌱",
      });
      if (welcomeError) {
        console.error("Welcome bonus error:", welcomeError);
      } else {
        totalBonusForNewUser += welcomeBonus;
      }
    }

    if (referral_code && referralEnabled) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("referral_code", referral_code.toUpperCase().trim())
        .maybeSingle();

      if (referrer && referrer.id !== user_id) {
        referrerUserId = referrer.id;

        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("id")
          .eq("referee_id", user_id)
          .maybeSingle();

        if (!existingReferral) {
          if (refereeBonus > 0) {
            await supabase.rpc("wallet_transaction", {
              p_user_id: user_id,
              p_type: "CREDIT",
              p_amount: refereeBonus,
              p_source: "REFERRAL_BONUS",
              p_description: `Referral bonus for signing up with code ${referral_code}! 🎉`,
            });
            totalBonusForNewUser += refereeBonus;
          }

          if (referrerBonus > 0) {
            await supabase.rpc("wallet_transaction", {
              p_user_id: referrerUserId,
              p_type: "CREDIT",
              p_amount: referrerBonus,
              p_source: "REFERRAL_BONUS",
              p_description: `Referral bonus! Someone signed up using your code 🌳`,
            });
          }

          await supabase.from("referrals").insert({
            referrer_id: referrerUserId,
            referee_id: user_id,
            referrer_bonus: referrerBonus,
            referee_bonus: refereeBonus,
            status: "completed",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        welcome_bonus: welcomeBonus,
        referral_bonus: referrerUserId ? refereeBonus : 0,
        total_bonus: totalBonusForNewUser,
        referrer_credited: referrerUserId ? true : false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing signup bonus:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
