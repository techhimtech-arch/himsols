import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TreePine, CheckCircle, ArrowRight, Gift, Leaf, 
  Search, AlertCircle, Loader2, Heart, Download, MessageSquare,
  Cake, PartyPopper
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";

interface GiftCardInfo {
  id: string;
  code: string;
  value: number;
  balance: number;
  recipient_name?: string;
  expires_at: string;
  gift_message?: string;
  purchaser_name?: string;
  occasion?: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  banner_image: string | null;
  goal_amount: number;
  collected_amount: number;
  price_per_tree: number | null;
}

interface RedemptionResult {
  amount: number;
  trees_planted: number;
  remaining_balance: number;
  campaign_title: string;
  donation_id?: string;
}

const OCCASION_THEMES: Record<string, { emoji: string; color: string; label: string }> = {
  birthday: { emoji: "🎂", color: "from-pink-500/20 to-purple-500/20", label: "Birthday Gift" },
  wedding: { emoji: "💒", color: "from-rose-500/20 to-amber-500/20", label: "Wedding Gift" },
  valentine: { emoji: "❤️", color: "from-red-500/20 to-pink-500/20", label: "Valentine's Gift" },
  festival: { emoji: "🪔", color: "from-amber-500/20 to-orange-500/20", label: "Festival Gift" },
};

const RedeemGiftCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [giftCardCode, setGiftCardCode] = useState("");
  const [validatedCard, setValidatedCard] = useState<GiftCardInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<RedemptionResult | null>(null);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["active-campaigns-for-redemption"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const validateGiftCard = async () => {
    if (!giftCardCode.trim()) {
      toast({ title: "Enter Code", description: "Please enter a gift card code", variant: "destructive" });
      return;
    }
    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-gift-card", {
        body: { code: giftCardCode.trim() },
      });
      if (error || !data.valid) {
        toast({ title: "Invalid Gift Card", description: data?.error || "Gift card not found or expired", variant: "destructive" });
        setValidatedCard(null);
        return;
      }
      setValidatedCard(data.gift_card);
      setRedeemAmount(String(data.gift_card.balance));
      toast({ title: "Gift Card Validated ✅", description: `Balance: ₹${data.gift_card.balance.toLocaleString()}` });
    } catch (err: any) {
      toast({ title: "Validation Error", description: err.message, variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRedeem = async () => {
    if (!validatedCard || !selectedCampaign || !redeemAmount) {
      toast({ title: "Missing Information", description: "Please select a campaign and enter amount", variant: "destructive" });
      return;
    }
    const amount = parseFloat(redeemAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > validatedCard.balance) {
      toast({ title: "Insufficient Balance", description: `Maximum available: ₹${validatedCard.balance}`, variant: "destructive" });
      return;
    }
    setIsRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-gift-card", {
        body: {
          gift_card_code: validatedCard.code,
          campaign_id: selectedCampaign,
          amount: amount,
          user_id: user?.id,
        },
      });
      if (error || !data.success) throw new Error(data?.error || "Redemption failed");
      setRedemptionResult(data.redemption);
      toast({ title: "Redemption Successful! 🌱", description: `You donated ₹${data.redemption.amount} to ${data.redemption.campaign_title}!` });
    } catch (err: any) {
      toast({ title: "Redemption Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsRedeeming(false);
    }
  };

  const downloadCertificate = async () => {
    if (!redemptionResult?.donation_id) return;
    setIsDownloadingCert(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-donation-certificate", {
        body: { donationId: redemptionResult.donation_id },
      });
      if (error) throw new Error("Failed to generate certificate");
      
      // data is arraybuffer from edge function
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HIMSOLS-Donation-Certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificate Downloaded! 📜", description: "Your certificate of appreciation is ready." });
    } catch (err: any) {
      toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDownloadingCert(false);
    }
  };

  const resetForm = () => {
    setGiftCardCode("");
    setValidatedCard(null);
    setSelectedCampaign(null);
    setRedeemAmount("");
    setRedemptionResult(null);
  };

  const occasionTheme = validatedCard?.occasion ? OCCASION_THEMES[validatedCard.occasion] : null;

  // Success Screen
  if (redemptionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <SEO title="Gift Card Redeemed - Himsols" description="Your gift card has been successfully redeemed." />
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-lg mx-auto">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-green-500/10 rounded-t-lg">
                <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <TreePine className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Donation Successful! 🌳</CardTitle>
                <CardDescription>Your gift card contribution made a real impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Impact Display */}
                <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold mb-1">₹{redemptionResult.amount.toLocaleString()}</div>
                  <p className="text-lg opacity-90">Donated Successfully</p>
                  <p className="text-sm opacity-75 mt-2">to {redemptionResult.campaign_title}</p>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Amount Donated</span>
                    <span className="font-medium">₹{redemptionResult.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Remaining Balance</span>
                    <span className="font-medium">₹{redemptionResult.remaining_balance.toLocaleString()}</span>
                  </div>
                </div>

                {/* Certificate Download */}
                {redemptionResult.donation_id && (
                  <Button 
                    onClick={downloadCertificate} 
                    variant="outline" 
                    className="w-full gap-2 border-primary/30"
                    disabled={isDownloadingCert}
                  >
                    {isDownloadingCert ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloadingCert ? "Generating..." : "Download Certificate of Appreciation 📜"}
                  </Button>
                )}

                {/* Emotional Message */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    "Your contribution supports local farmers and Himachal's future." 💚
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  {redemptionResult.remaining_balance > 0 && (
                    <Button onClick={resetForm} className="w-full">
                      Redeem Remaining Balance
                    </Button>
                  )}
                  <Link to="/my-contributions" className="w-full">
                    <Button variant="outline" className="w-full">View My Contributions</Button>
                  </Link>
                  <Link to="/gift-cards" className="w-full">
                    <Button variant="ghost" className="w-full gap-2">
                      <Gift className="h-4 w-4" /> Buy More Gift Cards
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <SEO
        title="Redeem Gift Card - Himsols Green Gift Cards"
        description="Redeem your Himsols Green Gift Card for verified tree plantation campaigns in Himachal Pradesh."
        keywords="redeem gift card, tree plantation, green gift, Himachal Pradesh"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Leaf className="h-3 w-3 mr-1" /> Redeem Your Gift
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Redeem Green Gift Card 🌱</h1>
          <p className="text-muted-foreground">Enter your gift card code and choose a campaign to support</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Enter Code */}
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
                Enter Gift Card Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="GC-XXXX-XXXX"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                  className="font-mono text-lg tracking-wider"
                  disabled={!!validatedCard}
                />
                <Button 
                  onClick={validateGiftCard} 
                  disabled={isValidating || !!validatedCard}
                  className="gap-2 px-6"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : validatedCard ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {validatedCard ? "Verified" : "Validate"}
                </Button>
              </div>

              {/* Validated Card Info */}
              {validatedCard && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-primary">₹{validatedCard.balance.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetForm} className="text-muted-foreground">
                        Use Different Card
                      </Button>
                    </div>
                    {validatedCard.recipient_name && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Gifted to: {validatedCard.recipient_name}
                      </p>
                    )}
                  </div>

                  {/* Personal Message from Sender */}
                  {(validatedCard.gift_message || validatedCard.purchaser_name) && (
                    <div className={`rounded-xl p-5 border ${occasionTheme ? `bg-gradient-to-br ${occasionTheme.color} border-primary/20` : 'bg-muted/50 border-muted'}`}>
                      {occasionTheme && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{occasionTheme.emoji}</span>
                          <Badge variant="secondary" className="text-xs">{occasionTheme.label}</Badge>
                        </div>
                      )}
                      {validatedCard.gift_message && (
                        <div className="flex gap-3 items-start">
                          <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium italic text-foreground">"{validatedCard.gift_message}"</p>
                            {validatedCard.purchaser_name && (
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Heart className="h-3 w-3 text-pink-500" />
                                From: {validatedCard.purchaser_name}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {!validatedCard.gift_message && validatedCard.purchaser_name && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          A green gift from <strong>{validatedCard.purchaser_name}</strong> 💚
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Select Campaign */}
          {validatedCard && (
            <Card className="mb-6 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm">2</span>
                  Choose a Campaign
                </CardTitle>
                <CardDescription>Redeemable only for verified Himsols green campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active campaigns at the moment</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {campaigns.map((campaign) => {
                      const progress = (campaign.collected_amount / campaign.goal_amount) * 100;
                      const isSelected = selectedCampaign === campaign.id;
                      return (
                        <div
                          key={campaign.id}
                          onClick={() => setSelectedCampaign(campaign.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <div className="flex gap-4">
                            {campaign.banner_image && (
                              <img src={campaign.banner_image} alt={campaign.title} className="w-20 h-20 object-cover rounded-lg" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold">{campaign.title}</h3>
                                {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{campaign.description}</p>
                              <div className="mt-2">
                                <Progress value={Math.min(progress, 100)} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                  ₹{campaign.collected_amount.toLocaleString()} / ₹{campaign.goal_amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Enter Amount & Redeem */}
          {validatedCard && selectedCampaign && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm">3</span>
                  Redeem Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount to Redeem (Max: ₹{validatedCard.balance})</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      max={validatedCard.balance}
                      min={1}
                      className="pl-8 text-lg"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRedeemAmount(String(Math.min(500, validatedCard.balance)))}>₹500</Button>
                    <Button variant="outline" size="sm" onClick={() => setRedeemAmount(String(Math.min(1000, validatedCard.balance)))}>₹1000</Button>
                    <Button variant="outline" size="sm" onClick={() => setRedeemAmount(String(validatedCard.balance))}>Full Balance</Button>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-lg gap-2" 
                  onClick={handleRedeem}
                  disabled={isRedeeming || !redeemAmount || parseFloat(redeemAmount) <= 0}
                >
                  {isRedeeming ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    <>🌱 Donate Now <ArrowRight className="h-5 w-5" /></>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground italic">
                  Your contribution supports local farmers and Himachal's future. You'll receive a certificate of appreciation.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Don't have a gift card? */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-3">Don't have a gift card yet?</p>
              <Link to="/gift-cards">
                <Button variant="outline" className="gap-2">
                  <Gift className="h-4 w-4" /> Buy Green Gift Card
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RedeemGiftCard;
