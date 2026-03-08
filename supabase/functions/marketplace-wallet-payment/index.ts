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
    // Verify JWT - extract authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user_id = claimsData.claims.sub;

    const { items, total_price, delivery_address, district, state, notes } = await req.json();

    if (!items || !total_price || !delivery_address || !district || !state) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (total_price < 1) {
      return new Response(
        JSON.stringify({ success: false, error: "Total must be at least ₹1" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    if (Number(wallet.balance) < total_price) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient wallet balance", current_balance: wallet.balance }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: orderNum, error: numError } = await supabase.rpc("generate_marketplace_order_number");
    if (numError) throw numError;

    const newBalance = Number(wallet.balance) - total_price;

    const { data: order, error: orderError } = await supabase
      .from("marketplace_orders")
      .insert({
        order_number: orderNum,
        user_id,
        items,
        total_price,
        delivery_address,
        district,
        state,
        notes: notes ? `${notes} | Paid via wallet` : "Paid via wallet",
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    const { error: updateWalletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateWalletError) {
      await supabase.from("marketplace_orders").delete().eq("id", order.id);
      throw new Error("Failed to update wallet balance");
    }

    const { error: txnError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id,
        type: "DEBIT",
        amount: total_price,
        source: "MARKETPLACE",
        reference_id: order.id,
        description: `Marketplace order ${orderNum}`,
        balance_after: newBalance,
      });

    if (txnError) {
      console.error("Error creating transaction record:", txnError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: orderNum,
        amount_debited: total_price,
        new_balance: newBalance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing marketplace wallet payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
