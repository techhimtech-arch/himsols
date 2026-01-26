import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Campaign {
  id: string;
  title: string;
  description: string;
  banner_image: string | null;
  goal_amount: number;
  collected_amount: number;
  price_per_tree: number | null;
}

export const FeaturedCampaignsSection = () => {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["featured-campaigns-homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, banner_image, goal_amount, collected_amount, price_per_tree")
        .eq("status", "ACTIVE")
        .eq("show_on_homepage", true)
        .order("sort_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data as Campaign[];
    },
  });

  // Don't render the section if no campaigns to show
  if (!isLoading && campaigns.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Active Campaigns</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Support Our Green Missions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of contributors in making our planet greener. 
            Every contribution plants trees and creates lasting impact.
          </p>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link to="/campaigns">
            <Button variant="outline" size="lg" className="group">
              View All Campaigns
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
