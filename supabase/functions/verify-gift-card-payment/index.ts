import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  recipient_name?: string;
  recipient_email?: string;
  gift_message?: string;
  purchaser_name: string;
  purchaser_email: string;
  user_id?: string;
}

// HMAC-SHA256 signature verification
async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      recipient_name,
      recipient_email,
      gift_message,
      purchaser_name,
      purchaser_email,
      user_id,
    }: VerifyPaymentRequest = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const isValid = await verifySignature(body, razorpay_signature, RAZORPAY_KEY_SECRET);

    if (!isValid) {
      throw new Error("Invalid payment signature");
    }

    // Generate unique gift card code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_gift_card_code');

    if (codeError) {
      console.error("Code generation error:", codeError);
      throw new Error("Failed to generate gift card code");
    }

    const giftCardCode = codeData;

    // Create gift card record
    const { data: giftCard, error: insertError } = await supabase
      .from("gift_cards")
      .insert({
        code: giftCardCode,
        value: amount,
        balance: amount,
        status: "active",
        recipient_name: recipient_name || null,
        recipient_email: recipient_email || null,
        gift_message: gift_message || null,
        purchaser_id: user_id || null,
        purchaser_name: purchaser_name,
        purchaser_email: purchaser_email,
        payment_id: razorpay_payment_id,
        payment_gateway: "razorpay",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create gift card");
    }

    return new Response(
      JSON.stringify({
        verified: true,
        gift_card: {
          code: giftCard.code,
          value: giftCard.value,
          expires_at: giftCard.expires_at,
          recipient_name: giftCard.recipient_name,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error verifying gift card payment:", error);
    return new Response(
      JSON.stringify({ error: error.message, verified: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
