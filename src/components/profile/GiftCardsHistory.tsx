import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Calendar, Share2, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  status: string;
  recipient_name: string | null;
  recipient_email: string | null;
  gift_message: string | null;
  created_at: string;
  expires_at: string;
}

export const GiftCardsHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: giftCards, isLoading } = useQuery({
    queryKey: ["user-gift-cards", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("purchaser_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GiftCard[];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string, balance: number, value: number) => {
    if (status === "expired") {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (balance === 0) {
      return <Badge variant="secondary">Fully Redeemed</Badge>;
    }
    if (balance < value) {
      return <Badge className="bg-orange-500">Partially Used</Badge>;
    }
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Gift card code copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareOnWhatsApp = (giftCard: GiftCard) => {
    const redeemUrl = `${window.location.origin}/redeem-gift-card`;
    const message = `🎁 *Green Gift Card from Himsols*

Hi${giftCard.recipient_name ? ` ${giftCard.recipient_name}` : ""}!

I've sent you a Green Gift Card worth *₹${giftCard.value}* to plant trees and make a difference! 🌳

*Gift Card Code:* ${giftCard.code}
${giftCard.gift_message ? `\n*Message:* ${giftCard.gift_message}\n` : ""}
*How to redeem:*
1. Go to ${redeemUrl}
2. Enter the code: ${giftCard.code}
3. Choose a campaign to support
4. Plant trees and make an impact! 🌍

This gift card is valid till ${format(new Date(giftCard.expires_at), "dd MMM yyyy")}.

Together, let's make Earth greener! 💚

- Sent via Himsols`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!giftCards || giftCards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No gift cards purchased yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Purchase a Green Gift Card to share the joy of giving
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalValue = giftCards.reduce((sum, gc) => sum + gc.value, 0);
  const activeCards = giftCards.filter((gc) => gc.balance > 0 && gc.status !== "expired").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/10">
          <CardContent className="pt-4 text-center">
            <Gift className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{giftCards.length}</p>
            <p className="text-sm text-muted-foreground">Cards Purchased</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10">
          <CardContent className="pt-4 text-center">
            <span className="text-xl font-bold text-green-600">₹</span>
            <p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Gift Card List */}
      <div className="space-y-4">
        {giftCards.map((giftCard) => (
          <Card key={giftCard.id} className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-green-500/20 px-4 py-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-lg">{giftCard.code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(giftCard.code, giftCard.id)}
                >
                  {copiedId === giftCard.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">₹{giftCard.value}</span>
                    {giftCard.balance < giftCard.value && (
                      <span className="text-sm text-muted-foreground">
                        (₹{giftCard.balance} remaining)
                      </span>
                    )}
                  </div>
                  {giftCard.recipient_name && (
                    <p className="text-sm text-muted-foreground">
                      For: {giftCard.recipient_name}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(giftCard.created_at), "dd MMM yyyy")}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(giftCard.status, giftCard.balance, giftCard.value)}
                </div>
              </div>

              {giftCard.gift_message && (
                <p className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-3 mb-3">
                  "{giftCard.gift_message}"
                </p>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Valid till {format(new Date(giftCard.expires_at), "dd MMM yyyy")}
                </span>
                {giftCard.balance > 0 && giftCard.status !== "expired" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => shareOnWhatsApp(giftCard)}
                  >
                    <Share2 className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
