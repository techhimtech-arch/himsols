import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Gift, Users, Sparkles, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuthSafe } from "@/hooks/useAuth";

export const ReferralBannerSection = memo(() => {
  const { settings, isLoading } = useSiteSettings();
  const { user } = useAuthSafe();

  // Don't show if disabled or loading
  if (isLoading) return null;
  if (settings?.referral_enabled !== 'true') return null;
  if (settings?.show_referral_banner !== 'true') return null;

  const welcomeBonus = settings?.welcome_bonus_amount || '10';
  const referrerBonus = settings?.referral_bonus_referrer || '25';
  const refereeBonus = settings?.referral_bonus_referee || '15';

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
      
      <div className="container mx-auto relative z-10">
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left - Content */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-4 w-4" />
                <span>Earn Rewards</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Join Himsols & Get <span className="text-primary">₹{welcomeBonus}</span> Free!
              </h2>
              
              <p className="text-muted-foreground text-base md:text-lg max-w-xl">
                Sustainability ka saathi bano! Sign up karo aur instant wallet bonus paao. 
                Friends ko refer karo, aur dono earn karo! 🌱
              </p>
            </div>

            {/* Right - Bonus Cards */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Welcome Bonus Card */}
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-lg flex-1 min-w-[180px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Sign Up Bonus</span>
                </div>
                <div className="text-3xl font-bold text-primary">₹{welcomeBonus}</div>
                <p className="text-xs text-muted-foreground mt-1">Instant credit on signup</p>
              </div>

              {/* Referral Bonus Card */}
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-lg flex-1 min-w-[180px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Referral Bonus</span>
                </div>
                <div className="text-3xl font-bold text-secondary">₹{referrerBonus}</div>
                <p className="text-xs text-muted-foreground mt-1">You earn per referral</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {!user ? (
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg">
                  <Gift className="h-5 w-5" />
                  Sign Up & Get ₹{welcomeBonus}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/profile?tab=referrals">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg">
                  <Users className="h-5 w-5" />
                  Refer & Earn ₹{referrerBonus}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <span className="hidden sm:inline">•</span>
              <span>Friend ko bhi milega ₹{refereeBonus} bonus!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ReferralBannerSection.displayName = "ReferralBannerSection";
