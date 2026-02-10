import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      throw new Error("Gift card code is required");
    }

    const normalizedCode = code.trim().toUpperCase();

    // Fetch gift card with message, occasion, and purchaser info
    const { data: giftCard, error } = await supabase
      .from("gift_cards")
      .select("id, code, value, balance, status, recipient_name, expires_at, created_at, gift_message, purchaser_name, occasion")
      .eq("code", normalizedCode)
      .single();

    if (error || !giftCard) {
      return new Response(
        JSON.stringify({ valid: false, error: "Gift card not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(giftCard.expires_at);
    
    if (expiresAt < now) {
      await supabase
        .from("gift_cards")
        .update({ status: "expired" })
        .eq("id", giftCard.id);

      return new Response(
        JSON.stringify({ valid: false, error: "Gift card has expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (giftCard.status === "redeemed") {
      return new Response(
        JSON.stringify({ valid: false, error: "Gift card has been fully redeemed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (giftCard.status === "cancelled") {
      return new Response(
        JSON.stringify({ valid: false, error: "Gift card has been cancelled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (giftCard.balance <= 0) {
      return new Response(
        JSON.stringify({ valid: false, error: "Gift card has no remaining balance" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        gift_card: {
          id: giftCard.id,
          code: giftCard.code,
          value: giftCard.value,
          balance: giftCard.balance,
          recipient_name: giftCard.recipient_name,
          expires_at: giftCard.expires_at,
          gift_message: giftCard.gift_message,
          purchaser_name: giftCard.purchaser_name,
          occasion: giftCard.occasion,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error validating gift card:", error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
