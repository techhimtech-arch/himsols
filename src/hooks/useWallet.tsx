import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface WalletTransaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  source: "RAZORPAY" | "GIFT_CARD" | "REFUND" | "REFERRAL" | "DONATION" | "MARKETPLACE";
  reference_id: string | null;
  description: string | null;
  balance_after: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no wallet exists, create one
      if (!data) {
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();
        
        if (createError) throw createError;
        setWallet(newWallet);
      } else {
        setWallet(data);
      }
    } catch (error: any) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTransactions = useCallback(async (limit = 20) => {
    if (!user) return;

    setTransactionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions((data || []) as WalletTransaction[]);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [user]);

  const topUpWithGiftCard = useCallback(async (giftCardCode: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to top up wallet",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Validate gift card
      const { data: validateData, error: validateError } = await supabase.functions.invoke(
        "validate-gift-card",
        { body: { code: giftCardCode } }
      );

      if (validateError || !validateData?.valid) {
        throw new Error(validateData?.error || "Invalid gift card");
      }

      const giftCard = validateData.gift_card;

      // Redeem to wallet via edge function
      const { data: redeemData, error: redeemError } = await supabase.functions.invoke(
        "redeem-gift-card-to-wallet",
        { 
          body: { 
            code: giftCardCode,
            user_id: user.id
          } 
        }
      );

      if (redeemError || !redeemData?.success) {
        throw new Error(redeemData?.error || "Failed to redeem gift card");
      }

      toast({
        title: "Wallet Topped Up! 🎉",
        description: `₹${giftCard.balance} added to your wallet`,
      });

      // Refresh wallet data
      await fetchWallet();
      await fetchTransactions();

      return { success: true, amount: giftCard.balance };
    } catch (error: any) {
      toast({
        title: "Top-up Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, toast, fetchWallet, fetchTransactions]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (wallet) {
      fetchTransactions();
    }
  }, [wallet, fetchTransactions]);

  return {
    wallet,
    balance: wallet?.balance || 0,
    transactions,
    loading,
    transactionsLoading,
    fetchWallet,
    fetchTransactions,
    topUpWithGiftCard,
  };
};
