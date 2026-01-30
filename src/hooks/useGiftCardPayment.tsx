import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GiftCardPurchaseOptions {
  amount: number;
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;
  purchaserName: string;
  purchaserEmail: string;
  userId?: string;
  onSuccess: (giftCard: { code: string; value: number; expires_at: string }) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useGiftCardPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const purchaseGiftCard = useCallback(
    async (options: GiftCardPurchaseOptions) => {
      setIsLoading(true);

      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load payment gateway");
        }

        // Create order
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          "create-gift-card-order",
          {
            body: {
              amount: options.amount,
              recipient_name: options.recipientName,
              recipient_email: options.recipientEmail,
              gift_message: options.giftMessage,
              purchaser_name: options.purchaserName,
              purchaser_email: options.purchaserEmail,
            },
          }
        );

        if (orderError || !orderData?.order_id) {
          throw new Error(orderData?.error || "Failed to create payment order");
        }

        // Open Razorpay checkout
        const razorpayOptions = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Himsols",
          description: `Green Gift Card - ₹${options.amount}`,
          order_id: orderData.order_id,
          prefill: {
            name: options.purchaserName,
            email: options.purchaserEmail,
          },
          theme: {
            color: "#16a34a",
          },
          handler: async (response: any) => {
            try {
              const { data: verifyData, error: verifyError } =
                await supabase.functions.invoke("verify-gift-card-payment", {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    amount: options.amount,
                    recipient_name: options.recipientName,
                    recipient_email: options.recipientEmail,
                    gift_message: options.giftMessage,
                    purchaser_name: options.purchaserName,
                    purchaser_email: options.purchaserEmail,
                    user_id: options.userId,
                  },
                });

              if (verifyError || !verifyData?.verified) {
                throw new Error(verifyData?.error || "Payment verification failed");
              }

              toast({
                title: "Gift Card Purchased! 🎁",
                description: `Your gift card code: ${verifyData.gift_card.code}`,
              });
              
              options.onSuccess(verifyData.gift_card);
            } catch (err: any) {
              toast({
                title: "Verification Error",
                description: err.message,
                variant: "destructive",
              });
              options.onError?.(err.message);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.on("payment.failed", (response: any) => {
          toast({
            title: "Payment Failed",
            description: response.error.description || "Something went wrong",
            variant: "destructive",
          });
          options.onError?.(response.error.description);
          setIsLoading(false);
        });

        razorpay.open();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        options.onError?.(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [loadRazorpayScript, toast]
  );

  return { purchaseGiftCard, isLoading };
};
