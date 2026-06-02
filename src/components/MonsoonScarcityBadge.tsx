import { useEffect, useState } from "react";
import { CloudRain, Clock } from "lucide-react";

const DEADLINE = new Date(`${new Date().getFullYear()}-08-31T23:59:59`);

export const isMonsoonWindow = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed: Jun=5, Jul=6, Aug=7
  return month >= 5 && month <= 7 && now <= DEADLINE;
};

interface Props {
  variant?: "default" | "compact";
  className?: string;
}

export const MonsoonScarcityBadge = ({ variant = "default", className = "" }: Props) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = DEADLINE.getTime() - Date.now();
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    };
    update();
    const id = setInterval(update, 1000 * 60 * 60);
    return () => clearInterval(id);
  }, []);

  if (!isMonsoonWindow() || daysLeft <= 0) return null;

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 ${className}`}>
        <Clock className="h-3 w-3" />
        {daysLeft} days left in monsoon window
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30 text-sm font-semibold text-amber-800 dark:text-amber-300 ${className}`}>
      <CloudRain className="h-4 w-4" />
      <span>Monsoon window: only {daysLeft} days left for 90%+ survival</span>
    </div>
  );
};
