import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TreePine, Users, ArrowRight } from "lucide-react";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    banner_image: string | null;
    goal_amount: number;
    collected_amount: number;
    price_per_tree: number | null;
  };
}

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const progress = campaign.goal_amount > 0 
    ? Math.min(100, (campaign.collected_amount / campaign.goal_amount) * 100) 
    : 0;
  
  const treesPlanted = Math.floor(campaign.collected_amount / (campaign.price_per_tree || 99));
  const treesGoal = Math.floor(campaign.goal_amount / (campaign.price_per_tree || 99));

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Banner Image */}
      <div className="relative h-48 overflow-hidden">
        {campaign.banner_image ? (
          <img
            src={campaign.banner_image}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <TreePine className="h-16 w-16 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg line-clamp-2">{campaign.title}</h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">₹{campaign.collected_amount.toLocaleString()}</span>
            <span className="text-muted-foreground">of ₹{campaign.goal_amount.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% funded</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-primary">
            <TreePine className="h-4 w-4" />
            <span>{treesPlanted} / {treesGoal} trees</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/campaign/${campaign.id}`} className="w-full">
          <Button className="w-full group/btn">
            Contribute Now
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
