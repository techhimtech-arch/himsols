import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RedeemRequest {
  gift_card_code: string;
  campaign_id: string;
  amount: number;
  user_id?: string;
  donor_name?: string;
  donor_email?: string;
}

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

    const { gift_card_code, campaign_id, amount, user_id, donor_name, donor_email }: RedeemRequest = await req.json();

    if (!gift_card_code || !campaign_id || !amount) {
      throw new Error("Missing required fields");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const normalizedCode = gift_card_code.trim().toUpperCase();

    // Start transaction - fetch gift card with lock
    const { data: giftCard, error: fetchError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", normalizedCode)
      .eq("status", "active")
      .single();

    if (fetchError || !giftCard) {
      throw new Error("Gift card not found or inactive");
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(giftCard.expires_at);
    if (expiresAt < now) {
      await supabase
        .from("gift_cards")
        .update({ status: "expired" })
        .eq("id", giftCard.id);
      throw new Error("Gift card has expired");
    }

    // Check balance
    if (giftCard.balance < amount) {
      throw new Error(`Insufficient balance. Available: ₹${giftCard.balance}`);
    }

    // Fetch campaign for tree calculation
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title, price_per_tree")
      .eq("id", campaign_id)
      .eq("status", "ACTIVE")
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found or inactive");
    }

    const pricePerTree = campaign.price_per_tree || 499;
    const treesPlanted = Math.floor(amount / pricePerTree);

    // Create donation record
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        campaign_id: campaign_id,
        user_id: user_id || giftCard.purchaser_id,
        amount: amount,
        payment_mode: "GIFT_CARD",
        payment_status: "SUCCESS",
        payment_id: `GC-${giftCard.code}`,
        donor_name: donor_name || giftCard.recipient_name || giftCard.purchaser_name,
        donor_email: donor_email || giftCard.recipient_email || giftCard.purchaser_email,
        gift_card_id: giftCard.id,
        notes: `Redeemed from gift card ${giftCard.code}`,
      })
      .select()
      .single();

    if (donationError) {
      console.error("Donation error:", donationError);
      throw new Error("Failed to create donation record");
    }

    // Create redemption record
    const { error: redemptionError } = await supabase
      .from("gift_card_redemptions")
      .insert({
        gift_card_id: giftCard.id,
        campaign_id: campaign_id,
        donation_id: donation.id,
        user_id: user_id || giftCard.purchaser_id,
        amount: amount,
        trees_planted: treesPlanted,
      });

    if (redemptionError) {
      console.error("Redemption error:", redemptionError);
      throw new Error("Failed to record redemption");
    }

    // Update gift card balance
    const newBalance = giftCard.balance - amount;
    const newStatus = newBalance <= 0 ? "redeemed" : "active";

    const { error: updateError } = await supabase
      .from("gift_cards")
      .update({ 
        balance: newBalance, 
        status: newStatus 
      })
      .eq("id", giftCard.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update gift card balance");
    }

    return new Response(
      JSON.stringify({
        success: true,
        redemption: {
          amount: amount,
          trees_planted: treesPlanted,
          remaining_balance: newBalance,
          campaign_title: campaign.title,
          donation_id: donation.id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error redeeming gift card:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
