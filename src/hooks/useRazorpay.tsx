import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RazorpayOptions {
  amount: number;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  userId: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
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

  const initiatePayment = useCallback(
    async (options: RazorpayOptions) => {
      setIsLoading(true);

      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load payment gateway");
        }

        // Create order via edge function
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: {
              amount: options.amount,
              campaign_id: options.campaignId,
              notes: {
                campaign_title: options.campaignTitle,
                donor_name: options.donorName,
              },
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
          description: `Contribution to ${options.campaignTitle}`,
          order_id: orderData.order_id,
          prefill: {
            name: options.donorName,
            email: options.donorEmail,
            contact: options.donorPhone || "",
          },
          theme: {
            color: "#16a34a",
          },
          handler: async (response: any) => {
            try {
              // Verify payment
              const { data: verifyData, error: verifyError } =
                await supabase.functions.invoke("verify-razorpay-payment", {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    campaign_id: options.campaignId,
                    user_id: options.userId,
                    amount: options.amount,
                    donor_name: options.donorName,
                    donor_email: options.donorEmail,
                    donor_phone: options.donorPhone,
                  },
                });

              if (verifyError || !verifyData?.verified) {
                throw new Error(verifyData?.error || "Payment verification failed");
              }

              toast({
                title: "Payment Successful! 🎉",
                description: "Thank you for your contribution!",
              });
              options.onSuccess();
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

  return { initiatePayment, isLoading };
};
