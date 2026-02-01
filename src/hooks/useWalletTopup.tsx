import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TopupOptions {
  amount: number;
  onSuccess: (newBalance: number) => void;
  onError?: (error: string) => void;
}

export const useWalletTopup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const topup = useCallback(
    async (options: TopupOptions) => {
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to top up wallet",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load payment gateway");
        }

        // Create order
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          "create-wallet-topup-order",
          {
            body: {
              amount: options.amount,
              user_id: user.id,
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
          description: `Wallet Top-up - ₹${options.amount}`,
          order_id: orderData.order_id,
          prefill: {
            email: user.email,
          },
          theme: {
            color: "#16a34a",
          },
          handler: async (response: any) => {
            try {
              const { data: verifyData, error: verifyError } =
                await supabase.functions.invoke("verify-wallet-topup", {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    amount: options.amount,
                    user_id: user.id,
                  },
                });

              if (verifyError || !verifyData?.verified) {
                throw new Error(verifyData?.error || "Payment verification failed");
              }

              toast({
                title: "Top-up Successful! 🎉",
                description: `₹${options.amount} added to your wallet`,
              });

              options.onSuccess(verifyData.new_balance);
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
    [user, toast, loadRazorpayScript]
  );

  return { topup, isLoading };
};
