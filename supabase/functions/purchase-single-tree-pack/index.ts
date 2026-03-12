import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PACK_PRICE = 299;
const PACK_QUANTITY = 1;
const PACK_NAME = "Single Tree Pack";

async function createHmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { payment_method } = body;

    // Find any active tree to use as tree_id reference (cheapest one)
    const { data: refTree, error: treeError } = await supabase
      .from("trees")
      .select("id")
      .eq("is_active", true)
      .order("price", { ascending: true })
      .limit(1)
      .single();

    if (treeError || !refTree) {
      return new Response(JSON.stringify({ error: "No trees available" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const createOrder = async (paymentNote: string) => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          tree_id: refTree.id,
          quantity: PACK_QUANTITY,
          total_price: PACK_PRICE,
          delivery_location: "To be assigned by Himsols",
          notes: `${PACK_NAME} - ${paymentNote}`,
          status: "pending",
        })
        .select("id")
        .single();
      if (orderError) throw new Error("Failed to create order");
      return order.id;
    };

    // ========== WALLET ==========
    if (payment_method === "wallet") {
      const { error: txError } = await supabase.rpc("wallet_transaction", {
        p_user_id: user.id,
        p_type: "DEBIT",
        p_amount: PACK_PRICE,
        p_source: "TREE_ORDER",
        p_description: `${PACK_NAME} - 1 Tree`,
      });

      if (txError) {
        return new Response(JSON.stringify({ error: txError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const orderId = await createOrder("Wallet Payment");
        return new Response(JSON.stringify({ success: true, order_id: orderId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        await supabase.rpc("wallet_transaction", {
          p_user_id: user.id, p_type: "CREDIT", p_amount: PACK_PRICE,
          p_source: "REFUND", p_description: `Refund - ${PACK_NAME} order failed`,
        });
        return new Response(JSON.stringify({ error: "Order failed. Wallet refunded." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    // ========== GIFT CARD ==========
    } else if (payment_method === "gift_card") {
      const { gift_card_code } = body;
      if (!gift_card_code) {
        return new Response(JSON.stringify({ error: "Gift card code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: giftCard, error: gcError } = await supabase
        .from("gift_cards").select("id, balance, status").eq("code", gift_card_code).single();

      if (gcError || !giftCard) {
        return new Response(JSON.stringify({ error: "Invalid gift card code" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (giftCard.status !== "active") {
        return new Response(JSON.stringify({ error: "Gift card is not active" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (giftCard.balance < PACK_PRICE) {
        return new Response(JSON.stringify({ error: `Insufficient balance. Need ₹${PACK_PRICE}, have ₹${giftCard.balance}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newBalance = giftCard.balance - PACK_PRICE;
      const updateData: any = { balance: newBalance, updated_at: new Date().toISOString() };
      if (newBalance === 0) updateData.status = "redeemed";

      const { error: updateError } = await supabase.from("gift_cards").update(updateData).eq("id", giftCard.id);
      if (updateError) {
        return new Response(JSON.stringify({ error: "Failed to debit gift card" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const orderId = await createOrder(`Gift Card ${gift_card_code}`);
        return new Response(JSON.stringify({ success: true, order_id: orderId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        await supabase.from("gift_cards").update({ balance: giftCard.balance, status: "active" }).eq("id", giftCard.id);
        return new Response(JSON.stringify({ error: "Order failed. Gift card refunded." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    // ========== RAZORPAY ==========
    } else if (payment_method === "razorpay") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
      const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (!razorpayKeySecret) {
        return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const signBody = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = await createHmacSha256(razorpayKeySecret, signBody);

      if (expectedSignature !== razorpay_signature) {
        return new Response(JSON.stringify({ error: "Payment verification failed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const orderId = await createOrder(`Razorpay ${razorpay_payment_id}`);
        return new Response(JSON.stringify({ success: true, order_id: orderId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Payment verified but order creation failed. Contact support." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    } else {
      return new Response(JSON.stringify({ error: "Invalid payment method" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
