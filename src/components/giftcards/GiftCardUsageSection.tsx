import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, TreePine, Wallet, ShoppingBag, Heart, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { useGiftCardPageContent } from "@/hooks/useGiftCardPageContent";
import { useLanguage } from "@/hooks/useLanguage";

const iconMap: Record<string, React.ReactNode> = {
  TreePine: <TreePine className="h-5 w-5 text-primary" />,
  Wallet: <Wallet className="h-5 w-5 text-blue-500" />,
  ShoppingBag: <ShoppingBag className="h-5 w-5 text-orange-500" />,
  Heart: <Heart className="h-5 w-5 text-pink-500" />,
  Leaf: <Leaf className="h-5 w-5 text-green-500" />,
  Gift: <Gift className="h-5 w-5 text-primary" />,
};

const iconBgMap: Record<string, string> = {
  TreePine: "bg-primary/10",
  Wallet: "bg-blue-500/10",
  ShoppingBag: "bg-orange-500/10",
  Heart: "bg-pink-500/10",
  Leaf: "bg-green-500/10",
  Gift: "bg-primary/10",
};

export const GiftCardUsageSection = () => {
  const { data: content, isLoading } = useGiftCardPageContent();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-green-500/5">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-green-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Gift Card कहाँ Use करें?
        </CardTitle>
        <CardDescription>
          Himsols Green Gift Cards के तरीके हैं redeem करने के
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((item) => {
          const title = language === "hi" ? (item.title_hi || item.title_en) : item.title_en;
          const description = language === "hi" ? (item.description_hi || item.description_en) : item.description_en;
          const linkText = language === "hi" ? (item.link_text_hi || item.link_text_en) : item.link_text_en;
          const icon = item.icon || "Gift";
          
          return (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className={`p-2 ${iconBgMap[icon] || "bg-primary/10"} rounded-full shrink-0`}>
                {iconMap[icon] || <Gift className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <h4 className="font-semibold text-primary">{title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                {item.link_url && linkText && (
                  <Link to={item.link_url} className="text-xs text-primary hover:underline mt-1 inline-block">
                    → {linkText}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
