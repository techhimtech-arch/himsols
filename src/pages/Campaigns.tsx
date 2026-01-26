import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  banner_image: string | null;
  goal_amount: number;
  collected_amount: number;
  price_per_tree: number | null;
  start_date: string | null;
  end_date: string | null;
}

const Campaigns = () => {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["active-campaigns"],
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Campaigns | Himsols" 
        description="Support our environmental campaigns. Contribute to tree plantation drives and make a positive impact."
      />
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Active Campaigns</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Support Our Green Missions
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of contributors in making our planet greener. 
              Every contribution plants trees and creates lasting impact.
            </p>
          </div>
        </section>

        {/* Campaigns Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16">
                <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Active Campaigns</h2>
                <p className="text-muted-foreground">
                  Check back soon for new campaigns to support!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Campaigns;
