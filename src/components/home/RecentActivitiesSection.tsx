import { useState, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, MapPin, Calendar, ArrowRight, Activity, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  location: string;
  icon: string;
  status: string;
  created_at: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TreePine,
  MapPin,
  Calendar,
  Activity,
};

export const RecentActivitiesSection = memo(() => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(4);

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getIcon = (iconName: string) => {
    return ICON_MAP[iconName] || Activity;
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 px-4 relative">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="container mx-auto relative z-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 px-4 relative">
      <div className="absolute inset-0 bg-muted/20" />
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Updates
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recent Activities</h2>
            <p className="text-muted-foreground mt-1">What's happening on the ground right now</p>
          </div>
          <Link to="/gallery">
            <Button variant="outline" className="gap-2">
              View All Activities
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Activities List */}
        <div className="grid md:grid-cols-2 gap-4">
          {activities.map((activity) => {
            const IconComponent = getIcon(activity.icon);
            return (
              <Card 
                key={activity.id}
                className="bg-background/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.status === 'active' ? 'bg-secondary/20' : 'bg-primary/20'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        activity.status === 'active' ? 'text-secondary' : 'text-primary'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{activity.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'active' 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {getTimeAgo(activity.created_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
});

RecentActivitiesSection.displayName = "RecentActivitiesSection";