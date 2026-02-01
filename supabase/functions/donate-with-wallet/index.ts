import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, campaign_id, amount, donor_name, donor_email, donor_phone } = await req.json();

    if (!user_id || !campaign_id || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount < 1) {
      return new Response(
        JSON.stringify({ success: false, error: "Amount must be at least ₹1" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ success: false, error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check sufficient balance
    if (Number(wallet.balance) < amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Insufficient wallet balance",
          current_balance: wallet.balance 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title, status")
      .eq("id", campaign_id)
      .eq("status", "ACTIVE")
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, error: "Campaign not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newBalance = Number(wallet.balance) - amount;

    // Create donation record first
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        campaign_id,
        user_id,
        amount,
        payment_mode: "DIRECT",
        payment_status: "SUCCESS",
        payment_gateway: "wallet",
        donor_name,
        donor_email,
        donor_phone,
        notes: "Paid via wallet balance",
      })
      .select()
      .single();

    if (donationError) {
      console.error("Error creating donation:", donationError);
      throw new Error("Failed to create donation record");
    }

    // Debit wallet balance
    const { error: updateWalletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateWalletError) {
      // Rollback donation if wallet update fails
      await supabase.from("donations").delete().eq("id", donation.id);
      throw new Error("Failed to update wallet balance");
    }

    // Create wallet transaction record
    const { error: txnError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id,
        type: "DEBIT",
        amount,
        source: "DONATION",
        reference_id: donation.id,
        description: `Donation to ${campaign.title}`,
        balance_after: newBalance,
      });

    if (txnError) {
      console.error("Error creating transaction record:", txnError);
      // Don't fail the whole operation for this, donation is already done
    }

    return new Response(
      JSON.stringify({
        success: true,
        donation_id: donation.id,
        amount_debited: amount,
        new_balance: newBalance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing wallet donation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
