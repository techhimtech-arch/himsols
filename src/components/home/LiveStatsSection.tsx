import { useEffect, useState, memo } from "react";
import { TreePine, Users, MapPin, Recycle, TrendingUp } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startCount = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startCount + (end - startCount) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
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

    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span id={`counter-${end}`}>
      {count}{suffix}
    </span>
  );
};

const stats = [
  {
    icon: TreePine,
    value: 450,
    suffix: "+",
    label: "Trees Planted",
    sublabel: "This Year",
    color: "primary"
  },
  {
    icon: MapPin,
    value: 5,
    suffix: "",
    label: "Villages Onboarded",
    sublabel: "Active Regions",
    color: "secondary"
  },
  {
    icon: Users,
    value: 120,
    suffix: "+",
    label: "Community Members",
    sublabel: "And Growing",
    color: "primary"
  },
  {
    icon: Recycle,
    value: 2,
    suffix: "T",
    label: "Scrap Recycled",
    sublabel: "Tonnes Saved",
    color: "secondary"
  }
];

export const LiveStatsSection = memo(() => {
  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            <span>Live Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Real Work, Real Numbers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Track our progress in building sustainable communities across Himachal Pradesh
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 md:p-8 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                </div>
                
                {/* Value */}
                <div className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-1 bg-gradient-to-r ${stat.color === 'primary' ? 'from-primary to-secondary' : 'from-secondary to-primary'} bg-clip-text text-transparent`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                
                {/* Labels */}
                <div className="text-foreground font-medium text-sm md:text-base">{stat.label}</div>
                <div className="text-muted-foreground text-xs md:text-sm">{stat.sublabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

LiveStatsSection.displayName = "LiveStatsSection";
