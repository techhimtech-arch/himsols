import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PACK_PRICE = 2699;
const PACK_QUANTITY = 10;

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

    // Get user from auth header
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
    const { payment_method, delivery_location, state, district, notes } = body;

    // Find the Climate Impact Pack tree
    const { data: packTree, error: treeError } = await supabase
      .from("trees")
      .select("id")
      .eq("name", "Climate Impact Pack")
      .eq("is_active", true)
      .single();

    if (treeError || !packTree) {
      return new Response(JSON.stringify({ error: "Climate Impact Pack not available" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle different payment methods
    if (payment_method === "wallet") {
      // Debit wallet
      const { data: txResult, error: txError } = await supabase.rpc("wallet_transaction", {
        p_user_id: user.id,
        p_type: "DEBIT",
        p_amount: PACK_PRICE,
        p_source: "TREE_ORDER",
        p_description: "Climate Impact Pack - 10 Trees",
      });

      if (txError) {
        return new Response(JSON.stringify({ error: txError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          tree_id: packTree.id,
          quantity: PACK_QUANTITY,
          total_price: PACK_PRICE,
          delivery_location: delivery_location || "To be assigned by Himsols",
          state: state || null,
          district: district || null,
          notes: notes || "Climate Impact Pack - Wallet Payment",
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) {
        // Refund wallet on order creation failure
        await supabase.rpc("wallet_transaction", {
          p_user_id: user.id,
          p_type: "CREDIT",
          p_amount: PACK_PRICE,
          p_source: "REFUND",
          p_description: "Refund - Climate Impact Pack order failed",
        });
        return new Response(JSON.stringify({ error: "Failed to create order" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, order_id: order.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (payment_method === "gift_card") {
      const { gift_card_code } = body;
      if (!gift_card_code) {
        return new Response(JSON.stringify({ error: "Gift card code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate gift card
      const { data: giftCard, error: gcError } = await supabase
        .from("gift_cards")
        .select("id, balance, status")
        .eq("code", gift_card_code)
        .single();

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
        return new Response(JSON.stringify({ error: `Insufficient gift card balance. Need ₹${PACK_PRICE}, have ₹${giftCard.balance}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Debit gift card
      const newBalance = giftCard.balance - PACK_PRICE;
      const updateData: any = { balance: newBalance, updated_at: new Date().toISOString() };
      if (newBalance === 0) updateData.status = "redeemed";

      const { error: updateError } = await supabase
        .from("gift_cards")
        .update(updateData)
        .eq("id", giftCard.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: "Failed to debit gift card" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          tree_id: packTree.id,
          quantity: PACK_QUANTITY,
          total_price: PACK_PRICE,
          delivery_location: delivery_location || "To be assigned by Himsols",
          state: state || null,
          district: district || null,
          notes: notes || `Climate Impact Pack - Gift Card ${gift_card_code}`,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) {
        // Refund gift card
        await supabase.from("gift_cards").update({ balance: giftCard.balance, status: "active" }).eq("id", giftCard.id);
        return new Response(JSON.stringify({ error: "Failed to create order" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, order_id: order.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (payment_method === "razorpay") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
      const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (!razorpayKeySecret) {
        return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify signature
      const signBody = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = await createHmacSha256(razorpayKeySecret, signBody);

      if (expectedSignature !== razorpay_signature) {
        return new Response(JSON.stringify({ error: "Payment verification failed", verified: false }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          tree_id: packTree.id,
          quantity: PACK_QUANTITY,
          total_price: PACK_PRICE,
          delivery_location: delivery_location || "To be assigned by Himsols",
          state: state || null,
          district: district || null,
          notes: notes || `Climate Impact Pack - Razorpay ${razorpay_payment_id}`,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) {
        return new Response(JSON.stringify({ error: "Failed to create order", verified: true }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, verified: true, order_id: order.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

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
