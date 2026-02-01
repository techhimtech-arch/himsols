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
    const { code, user_id } = await req.json();

    if (!code || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing code or user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the gift card
    const { data: giftCard, error: fetchError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (fetchError || !giftCard) {
      return new Response(
        JSON.stringify({ success: false, error: "Gift card not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate gift card
    if (giftCard.status === "redeemed" || giftCard.balance <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Gift card has no balance" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(giftCard.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Gift card has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountToAdd = giftCard.balance;

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (walletError && walletError.code === "PGRST116") {
      // Wallet doesn't exist, create one
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ user_id, balance: 0 })
        .select()
        .single();

      if (createError) throw createError;
      wallet = newWallet;
    } else if (walletError) {
      throw walletError;
    }

    const newBalance = Number(wallet.balance) + amountToAdd;

    // Update wallet balance
    const { error: updateWalletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateWalletError) throw updateWalletError;

    // Create transaction record
    const { error: txnError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id,
        type: "CREDIT",
        amount: amountToAdd,
        source: "GIFT_CARD",
        reference_id: giftCard.id,
        description: `Gift card ${code} redeemed to wallet`,
        balance_after: newBalance,
      });

    if (txnError) throw txnError;

    // Mark gift card as redeemed
    const { error: gcUpdateError } = await supabase
      .from("gift_cards")
      .update({ 
        balance: 0, 
        status: "redeemed",
        updated_at: new Date().toISOString()
      })
      .eq("id", giftCard.id);

    if (gcUpdateError) throw gcUpdateError;

    return new Response(
      JSON.stringify({
        success: true,
        amount_added: amountToAdd,
        new_balance: newBalance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error redeeming gift card to wallet:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
