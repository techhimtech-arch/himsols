import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, TreePine, Copy, CheckCircle, Heart, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGiftCardPayment } from "@/hooks/useGiftCardPayment";
import { GiftCardUsageSection } from "@/components/giftcards/GiftCardUsageSection";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ShareButtons } from "@/components/ShareButtons";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const OCCASIONS = [
  { id: "birthday", label: "Birthday 🎂", emoji: "🎂", message: "Wishing you a green birthday! May your year bloom like trees 🌳" },
  { id: "wedding", label: "Wedding 💒", emoji: "💒", message: "Congratulations on your new journey! Here's a forest growing with your love 💚" },
  { id: "valentine", label: "Valentine ❤️", emoji: "❤️", message: "My love for you grows like these trees! Happy Valentine's Day 🌹" },
  { id: "festival", label: "Festival 🪔", emoji: "🪔", message: "Celebrating with nature! Wishing you a green and joyful festival 🌿" },
] as const;

interface PurchasedGiftCard {
  code: string;
  value: number;
  expires_at: string;
}

const GiftCards = () => {
  const { user } = useAuth();
  const { purchaseGiftCard, isLoading } = useGiftCardPayment();
  const { toast } = useToast();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState(user?.email || "");
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  
  const [purchasedCard, setPurchasedCard] = useState<PurchasedGiftCard | null>(null);
  const [copied, setCopied] = useState(false);

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleOccasionSelect = (occasionId: string) => {
    if (selectedOccasion === occasionId) {
      setSelectedOccasion(null);
      setGiftMessage("");
      return;
    }
    setSelectedOccasion(occasionId);
    const occasion = OCCASIONS.find(o => o.id === occasionId);
    if (occasion) {
      setGiftMessage(occasion.message);
    }
  };

  const handlePurchase = async () => {
    if (!finalAmount || finalAmount < 1) {
      toast({ title: "Invalid Amount", description: "Minimum gift card amount is ₹1", variant: "destructive" });
      return;
    }
    if (!purchaserName || !purchaserEmail) {
      toast({ title: "Missing Information", description: "Please enter your name and email", variant: "destructive" });
      return;
    }

    await purchaseGiftCard({
      amount: finalAmount,
      recipientName: recipientName || undefined,
      recipientEmail: recipientEmail || undefined,
      giftMessage: giftMessage || undefined,
      purchaserName,
      purchaserEmail,
      userId: user?.id,
      onSuccess: (giftCard) => {
        setPurchasedCard(giftCard);
        // Store occasion in the gift card record
        if (selectedOccasion) {
          import("@/integrations/supabase/client").then(({ supabase }) => {
            supabase.from("gift_cards").update({ occasion: selectedOccasion }).eq("code", giftCard.code).then(() => {});
          });
        }
      },
    });
  };

  const copyToClipboard = async () => {
    if (purchasedCard) {
      await navigator.clipboard.writeText(purchasedCard.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Gift card code copied to clipboard" });
    }
  };

  const resetForm = () => {
    setPurchasedCard(null);
    setSelectedAmount(1000);
    setCustomAmount("");
    setRecipientName("");
    setRecipientEmail("");
    setGiftMessage("");
    setSelectedOccasion(null);
    setCopied(false);
  };

  // Success Screen
  if (purchasedCard) {
    const occasion = OCCASIONS.find(o => o.id === selectedOccasion);
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <SEO title="Gift Card Purchased - Himsols Green Gift Cards" description="Your green gift card has been successfully purchased." />
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-lg mx-auto">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-green-500/10 rounded-t-lg">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Purchase Successful! 🎉</CardTitle>
                <CardDescription>Your Green Gift Card is ready</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="relative bg-gradient-to-br from-primary to-green-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="absolute top-3 right-3">
                    {occasion ? <span className="text-3xl opacity-50">{occasion.emoji}</span> : <Gift className="h-8 w-8 opacity-30" />}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-5 w-5" />
                      <span className="font-medium">Himsols Green Gift Card</span>
                    </div>
                    {occasion && <Badge className="bg-white/20 text-white border-white/30 text-xs">{occasion.label}</Badge>}
                    <div className="text-3xl font-bold">₹{purchasedCard.value.toLocaleString()}</div>
                    <div className="font-mono text-xl tracking-wider bg-white/20 rounded-lg px-4 py-2 text-center">{purchasedCard.code}</div>
                    <div className="text-sm opacity-80">
                      Valid until: {new Date(purchasedCard.expires_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <Button onClick={copyToClipboard} variant="outline" className="w-full gap-2">
                  {copied ? (<><CheckCircle className="h-4 w-4 text-primary" /> Copied!</>) : (<><Copy className="h-4 w-4" /> Copy Code</>)}
                </Button>

                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Share2 className="h-3 w-3" /> Share this gift card
                  </p>
                  <ShareButtons
                    title="🎁 Green Gift Card from Himsols"
                    description={`I've got you a Green Gift Card worth ₹${purchasedCard.value} to plant trees! Use code: ${purchasedCard.code}`}
                    url="/redeem-gift-card"
                    variant="full"
                    size="sm"
                    className="justify-center"
                    whatsappMessage={`🎁 *Green Gift Card from Himsols*

Hi${recipientName ? ` ${recipientName}` : ''}!

I've sent you a Green Gift Card worth *₹${purchasedCard.value}*${occasion ? ` for ${occasion.label}` : ''} 🌳

*Gift Card Code:* ${purchasedCard.code}
${giftMessage ? `\n*Message:* ${giftMessage}\n` : ''}
*How to redeem:*
1. Go to ${window.location.origin}/redeem-gift-card
2. Enter the code: ${purchasedCard.code}
3. Choose a campaign to support
4. Make an impact! 🌍

Valid till: ${new Date(purchasedCard.expires_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

Together, let's make Earth greener! 💚

- Sent via Himsols`}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Link to="/redeem-gift-card" className="w-full">
                    <Button variant="default" className="w-full">Redeem Now</Button>
                  </Link>
                  <Button variant="outline" onClick={resetForm} className="w-full">Buy Another Gift Card</Button>
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
        title="Green Gift Cards - Give the Gift of Trees | Himsols"
        description="Purchase Green Gift Cards redeemable for verified tree plantation campaigns in Himachal Pradesh. The perfect eco-friendly gift."
        keywords="green gift cards, eco gift, tree plantation gift, sustainable gift, Himachal Pradesh"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Gift className="h-3 w-3 mr-1" /> Eco-Friendly Gifting
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Green Gift Cards 🌱</h1>
          <p className="text-lg text-muted-foreground">
            Give the gift of trees. Perfect for birthdays, anniversaries, or any occasion. 
            Redeemable for verified green campaigns in Himachal Pradesh.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> Buy Gift Card
              </CardTitle>
              <CardDescription>Select an amount and personalize your gift</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div className="space-y-3">
                <Label>Select Amount</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="h-14 text-lg"
                    >
                      ₹{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Or enter custom amount (min ₹1)"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min={1}
                    max={100000}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                </div>
              </div>

              {/* Occasion Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">🎉 Select Occasion (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {OCCASIONS.map((occasion) => (
                    <Button
                      key={occasion.id}
                      variant={selectedOccasion === occasion.id ? "default" : "outline"}
                      onClick={() => handleOccasionSelect(occasion.id)}
                      className="h-auto py-3 text-sm"
                      size="sm"
                    >
                      {occasion.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Purchaser Info */}
              <div className="space-y-3">
                <Label>Your Details</Label>
                <Input placeholder="Your Name *" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} />
                <Input type="email" placeholder="Your Email *" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} />
              </div>

              {/* Recipient Info */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" /> Gift To (Optional)
                </Label>
                <Input placeholder="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                <Input type="email" placeholder="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                <Textarea
                  placeholder="Add a personal message..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                className="w-full h-12 text-lg" 
                onClick={handlePurchase}
                disabled={isLoading || !finalAmount || finalAmount < 1}
              >
                {isLoading ? "Processing..." : `🎁 Buy Gift Card - ₹${finalAmount.toLocaleString()}`}
              </Button>
            </CardContent>
          </Card>

          {/* Right: Benefits & Info */}
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-primary to-green-600 text-white rounded-xl p-6 shadow-lg">
              <div className="absolute top-3 right-3">
                {selectedOccasion ? (
                  <span className="text-3xl opacity-50">{OCCASIONS.find(o => o.id === selectedOccasion)?.emoji}</span>
                ) : (
                  <Gift className="h-8 w-8 opacity-30" />
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  <span className="font-medium">Himsols Green Gift Card</span>
                </div>
                {selectedOccasion && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {OCCASIONS.find(o => o.id === selectedOccasion)?.label}
                  </Badge>
                )}
                <div className="text-3xl font-bold">₹{finalAmount ? finalAmount.toLocaleString() : "---"}</div>
                <div className="font-mono text-xl tracking-wider bg-white/20 rounded-lg px-4 py-2 text-center">GC-XXXX-XXXX</div>
                {recipientName && <p className="text-sm opacity-80">For: {recipientName}</p>}
              </div>
            </div>

            <GiftCardUsageSection />

            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Already have a gift card?</p>
                <Link to="/redeem-gift-card">
                  <Button variant="outline" className="gap-2">
                    <TreePine className="h-4 w-4" /> Redeem Gift Card
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GiftCards;
