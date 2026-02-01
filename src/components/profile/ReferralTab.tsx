import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Users, Gift, Wallet, Check, Loader2 } from "lucide-react";

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
}

export const ReferralTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;

      try {
        // Fetch user's referral code from profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        // Fetch referral stats (as referrer)
        const { data: referrals, error: referralsError } = await supabase
          .from("referrals")
          .select("referrer_bonus")
          .eq("referrer_id", user.id);

        if (referralsError) {
          console.error("Error fetching referrals:", referralsError);
        }

        const totalReferrals = referrals?.length || 0;
        const totalEarnings = referrals?.reduce((sum, r) => sum + (r.referrer_bonus || 0), 0) || 0;

        setStats({
          referralCode: profile?.referral_code || "",
          totalReferrals,
          totalEarnings,
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const referralLink = stats?.referralCode
    ? `${window.location.origin}/auth?ref=${stats.referralCode}`
    : "";

  const handleCopyCode = async () => {
    if (!stats?.referralCode) return;

    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareWhatsApp = () => {
    if (!referralLink || !stats?.referralCode) return;

    const message = encodeURIComponent(
      `🌱 Join Himsols and get ₹25 in your wallet!\n\nUse my referral code: ${stats.referralCode}\n\nSign up here: ${referralLink}\n\nTogether, let's plant more trees! 🌳`
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">People Referred</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ₹{stats?.totalEarnings?.toLocaleString("en-IN") || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/10 p-3 rounded-full">
                <Gift className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹25</p>
                <p className="text-sm text-muted-foreground">Per Referral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends. They get ₹25 and you get ₹25 when they sign up!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={stats?.referralCode || "Loading..."}
                readOnly
                className="text-center text-xl font-bold tracking-wider bg-muted"
              />
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="px-4"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Or share the direct link:</p>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm bg-muted"
              />
              <Button onClick={handleCopyLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleShareWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Share on WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Share Your Code</p>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code with friends and family
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">They Sign Up</p>
                <p className="text-sm text-muted-foreground">
                  When they create an account using your code, they get ₹25 instantly
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">You Earn ₹25</p>
                <p className="text-sm text-muted-foreground">
                  Once they complete signup, ₹25 is credited to your wallet
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
