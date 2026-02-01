import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Gift, CreditCard, RefreshCw, Loader2 } from "lucide-react";
import { useWallet, WalletTransaction } from "@/hooks/useWallet";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const sourceLabels: Record<string, string> = {
  RAZORPAY: "Online Payment",
  GIFT_CARD: "Gift Card",
  REFUND: "Refund",
  REFERRAL: "Referral Bonus",
  DONATION: "Campaign Donation",
  MARKETPLACE: "Marketplace Purchase",
};

const sourceIcons: Record<string, React.ReactNode> = {
  RAZORPAY: <CreditCard className="h-4 w-4" />,
  GIFT_CARD: <Gift className="h-4 w-4" />,
  REFUND: <RefreshCw className="h-4 w-4" />,
  REFERRAL: <ArrowUpCircle className="h-4 w-4" />,
  DONATION: <ArrowDownCircle className="h-4 w-4" />,
  MARKETPLACE: <ArrowDownCircle className="h-4 w-4" />,
};

export const WalletTab = () => {
  const { language } = useLanguage();
  const { balance, transactions, loading, transactionsLoading, topUpWithGiftCard, fetchWallet } = useWallet();
  const [giftCardCode, setGiftCardCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGiftCardRedeem = async () => {
    if (!giftCardCode.trim()) return;
    
    setIsRedeeming(true);
    const result = await topUpWithGiftCard(giftCardCode.trim().toUpperCase());
    setIsRedeeming(false);
    
    if (result.success) {
      setGiftCardCode("");
      setDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Available Balance" : "उपलब्ध राशि"}
              </p>
              <p className="text-4xl font-bold text-primary">
                ₹{balance.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-primary rounded-full p-4">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 gap-2">
                  <Gift className="h-4 w-4" />
                  {language === "en" ? "Add Gift Card" : "गिफ्ट कार्ड जोड़ें"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    {language === "en" ? "Redeem Gift Card to Wallet" : "गिफ्ट कार्ड वॉलेट में जोड़ें"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Input
                      placeholder="GC-XXXX-XXXX"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                      className="text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {language === "en" 
                        ? "Enter your gift card code to add balance to wallet" 
                        : "अपना गिफ्ट कार्ड कोड डालें"}
                    </p>
                  </div>
                  <Button 
                    onClick={handleGiftCardRedeem}
                    disabled={!giftCardCode.trim() || isRedeeming}
                    className="w-full"
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === "en" ? "Adding..." : "जोड़ रहे हैं..."}
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        {language === "en" ? "Add to Wallet" : "वॉलेट में जोड़ें"}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => fetchWallet()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {language === "en" ? "Refresh" : "रिफ्रेश"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === "en" ? "Transaction History" : "लेन-देन इतिहास"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "en" ? "No transactions yet" : "अभी तक कोई लेन-देन नहीं"}</p>
              <p className="text-sm mt-1">
                {language === "en" 
                  ? "Add a gift card or make a purchase to see transactions" 
                  : "गिफ्ट कार्ड जोड़ें या खरीदारी करें"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <TransactionItem key={txn.id} transaction={txn} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TransactionItem = ({ transaction }: { transaction: WalletTransaction }) => {
  const isCredit = transaction.type === "CREDIT";
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isCredit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {isCredit ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium text-sm">
            {transaction.description || sourceLabels[transaction.source]}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isCredit ? "text-green-600" : "text-red-600"}`}>
          {isCredit ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
        </p>
        <Badge variant="outline" className="text-xs">
          {sourceIcons[transaction.source]}
          <span className="ml-1">{sourceLabels[transaction.source]}</span>
        </Badge>
      </div>
    </div>
  );
};
