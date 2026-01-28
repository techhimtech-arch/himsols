import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TreePine, Target, Users, Heart, CheckCircle, ArrowLeft } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  banner_image: string | null;
  goal_amount: number;
  collected_amount: number;
  price_per_tree: number | null;
  allow_direct_payment: boolean;
  allow_gift_card: boolean;
  start_date: string | null;
  end_date: string | null;
}

const PRESET_AMOUNTS = [199, 499, 999, 2499];

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(499);
  const [customAmount, setCustomAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("status", "ACTIVE")
        .maybeSingle();
      if (error) throw error;
      return data as Campaign | null;
    },
    enabled: !!id,
  });

  const { data: donorCount = 0 } = useQuery({
    queryKey: ["campaign-donors", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("donations")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", id)
        .eq("payment_status", "SUCCESS");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const handleContribute = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 1) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Login Required", description: "Please login to contribute", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!campaign) return;

    initiatePayment({
      amount,
      campaignId: id!,
      campaignTitle: campaign.title,
      donorName: user.user_metadata?.full_name || "Anonymous",
      donorEmail: user.email || "",
      donorPhone: user.user_metadata?.phone,
      userId: user.id,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
        queryClient.invalidateQueries({ queryKey: ["campaign-donors", id] });
        setShowSuccess(true);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-24 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-16 text-center">
          <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This campaign may have ended or doesn't exist.
          </p>
          <Button onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            View All Campaigns
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Thank You! 🌱</h1>
                <p className="text-muted-foreground">
                  Your contribution to <strong>{campaign.title}</strong> has been received.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/my-contributions")}>
                  View My Contributions
                </Button>
                <Button variant="outline" onClick={() => navigate("/campaigns")}>
                  Support More Campaigns
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = campaign.goal_amount > 0 
    ? Math.min(100, (campaign.collected_amount / campaign.goal_amount) * 100) 
    : 0;
  const treesPlanted = Math.floor(campaign.collected_amount / (campaign.price_per_tree || 99));
  const treesGoal = Math.floor(campaign.goal_amount / (campaign.price_per_tree || 99));
  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;
  const treesFromContribution = Math.floor(finalAmount / (campaign.price_per_tree || 99));

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${campaign.title} | Campaigns`} description={campaign.description} />
      <Navbar />
      
      <main className="pt-20">
        {/* Banner */}
        <div className="relative h-64 md:h-80">
          {campaign.banner_image ? (
            <img
              src={campaign.banner_image}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <TreePine className="h-24 w-24 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
            <Button variant="ghost" className="text-white mb-2" onClick={() => navigate("/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Campaigns
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-white">{campaign.title}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Campaign Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        ₹{campaign.collected_amount.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">
                        raised of ₹{campaign.goal_amount.toLocaleString()} goal
                      </p>
                    </div>
                    <Badge variant="secondary">{progress.toFixed(0)}% Complete</Badge>
                  </div>
                  <Progress value={progress} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <TreePine className="h-6 w-6 mx-auto text-primary mb-1" />
                      <p className="font-bold">{treesPlanted}</p>
                      <p className="text-xs text-muted-foreground">Trees Planted</p>
                    </div>
                    <div className="text-center">
                      <Target className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                      <p className="font-bold">{treesGoal}</p>
                      <p className="text-xs text-muted-foreground">Trees Goal</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                      <p className="font-bold">{donorCount}</p>
                      <p className="text-xs text-muted-foreground">Contributors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{campaign.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Contribution Form */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Make a Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preset Amounts */}
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className="h-12"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <Input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      min="1"
                      className="h-12 text-center"
                    />
                  </div>

                  {/* Impact Preview */}
                  {finalAmount > 0 && (
                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">Your contribution will plant</p>
                      <p className="text-2xl font-bold text-primary">
                        {treesFromContribution} {treesFromContribution === 1 ? 'Tree' : 'Trees'}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={handleContribute}
                    disabled={isPaymentLoading || finalAmount < 1}
                  >
                    {isPaymentLoading ? "Processing..." : `Contribute ₹${finalAmount.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Secure payment • Get acknowledgement receipt
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
