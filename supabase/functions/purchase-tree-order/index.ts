import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Authenticate user
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
    const { payment_method, items, delivery_location, state, district, notes } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify prices from DB and calculate total
    const treeIds = items.map((i: any) => i.id);
    const { data: trees, error: treeError } = await supabase
      .from("trees")
      .select("id, price, stock_quantity, name")
      .in("id", treeIds)
      .eq("is_active", true);

    if (treeError || !trees || trees.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid trees selected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const treeMap = new Map(trees.map(t => [t.id, t]));
    let totalPrice = 0;
    const validatedItems: Array<{ id: string; quantity: number; price: number; name: string }> = [];

    for (const item of items) {
      const tree = treeMap.get(item.id);
      if (!tree) {
        return new Response(JSON.stringify({ error: `Tree ${item.id} not found or inactive` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (item.quantity > tree.stock_quantity) {
        return new Response(JSON.stringify({ error: `${tree.name} has only ${tree.stock_quantity} in stock` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const itemTotal = tree.price * item.quantity;
      totalPrice += itemTotal;
      validatedItems.push({ id: tree.id, quantity: item.quantity, price: tree.price, name: tree.name });
    }

    // Helper to create orders
    const createOrders = async (paymentNote: string) => {
      const orderPromises = validatedItems.map((item) =>
        supabase
          .from("orders")
          .insert({
            user_id: user.id,
            tree_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            delivery_location: delivery_location || "To be assigned by Himsols",
            state: state || null,
            district: district || null,
            notes: notes || paymentNote,
            status: "pending",
          })
          .select("id")
          .single()
      );

      const results = await Promise.all(orderPromises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        console.error("Order creation errors:", errors.map(e => e.error));
        throw new Error("Failed to create some orders");
      }
      return results.map((r) => r.data!.id);
    };

    // ========== WALLET PAYMENT ==========
    if (payment_method === "wallet") {
      const { data: txResult, error: txError } = await supabase.rpc("wallet_transaction", {
        p_user_id: user.id,
        p_type: "DEBIT",
        p_amount: totalPrice,
        p_source: "TREE_ORDER",
        p_description: `Tree order - ${validatedItems.map(i => `${i.name} x${i.quantity}`).join(", ")}`,
      });

      if (txError) {
        return new Response(JSON.stringify({ error: txError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const orderIds = await createOrders("Wallet Payment");
        return new Response(JSON.stringify({ success: true, order_ids: orderIds }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        // Refund wallet
        await supabase.rpc("wallet_transaction", {
          p_user_id: user.id,
          p_type: "CREDIT",
          p_amount: totalPrice,
          p_source: "REFUND",
          p_description: "Refund - Tree order failed",
        });
        return new Response(JSON.stringify({ error: "Failed to create order. Wallet refunded." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    // ========== GIFT CARD PAYMENT ==========
    } else if (payment_method === "gift_card") {
      const { gift_card_code } = body;
      if (!gift_card_code) {
        return new Response(JSON.stringify({ error: "Gift card code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      if (giftCard.balance < totalPrice) {
        return new Response(JSON.stringify({ error: `Insufficient gift card balance. Need ₹${totalPrice}, have ₹${giftCard.balance}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newBalance = giftCard.balance - totalPrice;
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

      try {
        const orderIds = await createOrders(`Gift Card ${gift_card_code}`);
        return new Response(JSON.stringify({ success: true, order_ids: orderIds }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        // Refund gift card
        await supabase.from("gift_cards").update({ balance: giftCard.balance, status: "active" }).eq("id", giftCard.id);
        return new Response(JSON.stringify({ error: "Failed to create order. Gift card refunded." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    // ========== RAZORPAY PAYMENT ==========
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
        const orderIds = await createOrders(`Razorpay ${razorpay_payment_id}`);
        return new Response(JSON.stringify({ success: true, order_ids: orderIds }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
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
