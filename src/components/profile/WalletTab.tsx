import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Gift, CreditCard, RefreshCw, Loader2, Plus, IndianRupee } from "lucide-react";
import { useWallet, WalletTransaction } from "@/hooks/useWallet";
import { useWalletTopup } from "@/hooks/useWalletTopup";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const TOPUP_AMOUNTS = [100, 250, 500, 1000, 2500];

export const WalletTab = () => {
  const { language } = useLanguage();
  const { balance, transactions, loading, transactionsLoading, topUpWithGiftCard, fetchWallet, fetchTransactions } = useWallet();
  const { topup, isLoading: isTopupLoading } = useWalletTopup();
  const [giftCardCode, setGiftCardCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

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

  const handleTopup = async (amount: number) => {
    await topup({
      amount,
      onSuccess: async (newBalance) => {
        await fetchWallet();
        await fetchTransactions();
        setDialogOpen(false);
        setCustomAmount("");
      },
    });
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
                  <Plus className="h-4 w-4" />
                  {language === "en" ? "Add Money" : "पैसे जोड़ें"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    {language === "en" ? "Add Money to Wallet" : "वॉलेट में पैसे जोड़ें"}
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="razorpay" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="razorpay" className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      {language === "en" ? "Pay Online" : "ऑनलाइन भुगतान"}
                    </TabsTrigger>
                    <TabsTrigger value="giftcard" className="gap-2">
                      <Gift className="h-4 w-4" />
                      {language === "en" ? "Gift Card" : "गिफ्ट कार्ड"}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="razorpay" className="space-y-4 pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === "en" ? "Select amount to add" : "जोड़ने के लिए राशि चुनें"}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {TOPUP_AMOUNTS.map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            onClick={() => handleTopup(amt)}
                            disabled={isTopupLoading}
                            className="h-12"
                          >
                            ₹{amt}
                          </Button>
                        ))}
                        <div className="col-span-3 flex gap-2 mt-2">
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Custom"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="pl-9"
                              min={1}
                            />
                          </div>
                          <Button
                            onClick={() => customAmount && handleTopup(Number(customAmount))}
                            disabled={!customAmount || Number(customAmount) < 1 || isTopupLoading}
                          >
                            {isTopupLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              language === "en" ? "Add" : "जोड़ें"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="giftcard" className="space-y-4 pt-4">
                    <div>
                      <Input
                        placeholder="GC-XXXX-XXXX"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                        className="text-center text-lg tracking-widest"
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {language === "en" 
                          ? "Enter your gift card code to add balance" 
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
                          {language === "en" ? "Redeem to Wallet" : "वॉलेट में जोड़ें"}
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => fetchWallet()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
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
