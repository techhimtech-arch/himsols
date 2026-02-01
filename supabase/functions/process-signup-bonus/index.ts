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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, referral_code } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing signup bonus for user: ${user_id}, referral_code: ${referral_code || "none"}`);

    // Fetch bonus settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["welcome_bonus_amount", "referral_bonus_referrer", "referral_bonus_referee", "referral_enabled"]);

    const settings: Record<string, string> = {};
    settingsData?.forEach((s) => {
      settings[s.key] = s.value || "0";
    });

    const welcomeBonus = parseFloat(settings.welcome_bonus_amount || "10");
    const referrerBonus = parseFloat(settings.referral_bonus_referrer || "25");
    const refereeBonus = parseFloat(settings.referral_bonus_referee || "15");
    const referralEnabled = settings.referral_enabled === "true";

    let totalBonusForNewUser = 0;
    let referrerUserId: string | null = null;

    // Credit welcome bonus
    if (welcomeBonus > 0) {
      const { data: welcomeResult, error: welcomeError } = await supabase.rpc("wallet_transaction", {
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
        console.log(`Welcome bonus of ₹${welcomeBonus} credited to user ${user_id}`);
      }
    }

    // Process referral if code provided and enabled
    if (referral_code && referralEnabled) {
      // Find the referrer by their referral code
      const { data: referrer, error: referrerError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("referral_code", referral_code.toUpperCase().trim())
        .maybeSingle();

      if (referrerError) {
        console.error("Referrer lookup error:", referrerError);
      }

      if (referrer && referrer.id !== user_id) {
        referrerUserId = referrer.id;

        // Check if this user was already referred (shouldn't happen due to UNIQUE constraint)
        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("id")
          .eq("referee_id", user_id)
          .maybeSingle();

        if (!existingReferral) {
          // Credit referee bonus to new user
          if (refereeBonus > 0) {
            const { error: refereeBonusError } = await supabase.rpc("wallet_transaction", {
              p_user_id: user_id,
              p_type: "CREDIT",
              p_amount: refereeBonus,
              p_source: "REFERRAL_BONUS",
              p_description: `Referral bonus for signing up with code ${referral_code}! 🎉`,
            });

            if (refereeBonusError) {
              console.error("Referee bonus error:", refereeBonusError);
            } else {
              totalBonusForNewUser += refereeBonus;
              console.log(`Referee bonus of ₹${refereeBonus} credited to user ${user_id}`);
            }
          }

          // Credit referrer bonus
          if (referrerBonus > 0) {
            const { error: referrerBonusError } = await supabase.rpc("wallet_transaction", {
              p_user_id: referrerUserId,
              p_type: "CREDIT",
              p_amount: referrerBonus,
              p_source: "REFERRAL_BONUS",
              p_description: `Referral bonus! Someone signed up using your code 🌳`,
            });

            if (referrerBonusError) {
              console.error("Referrer bonus error:", referrerBonusError);
            } else {
              console.log(`Referrer bonus of ₹${referrerBonus} credited to user ${referrerUserId}`);
            }
          }

          // Create referral record
          const { error: referralInsertError } = await supabase
            .from("referrals")
            .insert({
              referrer_id: referrerUserId,
              referee_id: user_id,
              referrer_bonus: referrerBonus,
              referee_bonus: refereeBonus,
              status: "completed",
            });

          if (referralInsertError) {
            console.error("Referral record error:", referralInsertError);
          } else {
            console.log(`Referral record created: ${referrerUserId} -> ${user_id}`);
          }
        } else {
          console.log(`User ${user_id} was already referred`);
        }
      } else if (referrer?.id === user_id) {
        console.log("Self-referral attempted, ignoring");
      } else {
        console.log(`Invalid referral code: ${referral_code}`);
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
