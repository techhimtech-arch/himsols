import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate caller via JWT
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ verified: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const authedUserId = userData.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ verified: false, error: "Missing payment details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ verified: false, error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the actual order from Razorpay to get verified amount + user_id from notes
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const orderResp = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (!orderResp.ok) {
      return new Response(
        JSON.stringify({ verified: false, error: "Could not verify order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const rzpOrder = await orderResp.json();
    const verifiedAmount = Number(rzpOrder.amount) / 100; // paise -> rupees
    const orderUserId = rzpOrder.notes?.user_id;

    if (!orderUserId || orderUserId !== authedUserId) {
      return new Response(
        JSON.stringify({ verified: false, error: "Order does not belong to caller" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!verifiedAmount || verifiedAmount <= 0) {
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid order amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // Idempotency: skip if this payment already processed
    const { data: existingTxn } = await supabase
      .from("wallet_transactions")
      .select("id, balance_after")
      .eq("user_id", authedUserId)
      .ilike("description", `%${razorpay_payment_id}%`)
      .maybeSingle();
    if (existingTxn) {
      return new Response(
        JSON.stringify({
          verified: true,
          new_balance: Number(existingTxn.balance_after),
          payment_id: razorpay_payment_id,
          idempotent: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", authedUserId)
      .single();

    if (walletError && walletError.code === "PGRST116") {
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ user_id: authedUserId, balance: 0 })
        .select()
        .single();
      if (createError) throw createError;
      wallet = newWallet;
    } else if (walletError) {
      throw walletError;
    }

    const newBalance = Number(wallet.balance) + verifiedAmount;

    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);
    if (updateError) throw updateError;

    const { error: txnError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id: authedUserId,
        type: "CREDIT",
        amount: verifiedAmount,
        source: "RAZORPAY",
        reference_id: null,
        description: `Wallet top-up via Razorpay (${razorpay_payment_id})`,
        balance_after: newBalance,
      });
    if (txnError) throw txnError;

    return new Response(
      JSON.stringify({
        verified: true,
        new_balance: newBalance,
        payment_id: razorpay_payment_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error verifying wallet top-up:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
