import { Button } from "@/components/ui/button";
import { MessageCircle, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const HeroShareReferralBar = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { settings } = useSiteSettings();

  const referrer = Number(settings?.referral_bonus_referrer || 100);
  const referee = Number(settings?.referral_bonus_referee || 50);
  const enabled = settings?.referral_enabled !== "false";

  const shareUrl = "https://himsols.com";
  const msg = isHi
    ? `🌳 Mai Himsols par ped laga raha hoon — Himachal ke kisaano ki zameen par verified tree plantation. Tum bhi sirf ₹299 me apna ped lagao aur geo-tagged proof pao 👇\n${shareUrl}`
    : `🌳 I'm planting trees with Himsols — verified plantations on farmer land in Himachal. Plant your own from just ₹299 and get geo-tagged proof 👇\n${shareUrl}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] p-2">
        <Button
          onClick={shareWhatsApp}
          variant="ghost"
          className="flex-1 justify-center gap-2 text-green-700 hover:bg-green-100/60"
        >
          <MessageCircle className="h-4 w-4" />
          {isHi ? "WhatsApp par share karo" : "Share on WhatsApp"}
        </Button>
        {enabled && (
          <Link to="/profile?tab=referrals" className="flex-1">
            <Button variant="ghost" className="w-full justify-center gap-2 text-primary hover:bg-primary/10">
              <Gift className="h-4 w-4" />
              {isHi
                ? `Refer karo, ₹${referrer} kamao (dost ko ₹${referee})`
                : `Refer & earn ₹${referrer} (friend gets ₹${referee})`}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
