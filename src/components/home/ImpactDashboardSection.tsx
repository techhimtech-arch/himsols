import { useEffect, useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TreePine, Users, MapPin, TrendingUp, Leaf, LucideIcon } from "lucide-react";

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const el = document.getElementById(`impact-counter-${end}-${suffix}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, suffix]);

  return <span id={`impact-counter-${end}-${suffix}`}>{count.toLocaleString()}{suffix}</span>;
};

const ICON_MAP: Record<string, LucideIcon> = { TreePine, MapPin, Users, TrendingUp, Leaf };

interface LiveStat {
  id: string; icon: string; value: number; suffix: string; label: string; sublabel: string | null; color: string;
}

export const ImpactDashboardSection = memo(() => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["live-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("live_stats").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data as LiveStat[];
    },
  });

  if (isLoading || !stats?.length) return null;

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Live Impact Overview
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Real Work, Real Numbers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Verified metrics from our on-ground operations across Himachal Pradesh.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => {
            const Icon = ICON_MAP[stat.icon] || TreePine;
            return (
              <div key={stat.id} className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-6 md:p-8 hover:border-primary/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} />
                </div>
                <div className="text-sm font-medium text-foreground">{stat.label}</div>
                {stat.sublabel && <div className="text-xs text-muted-foreground mt-0.5">{stat.sublabel}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

ImpactDashboardSection.displayName = "ImpactDashboardSection";
