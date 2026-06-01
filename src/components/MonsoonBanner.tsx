import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, CloudRain, ArrowRight } from "lucide-react";

const DISMISS_KEY = "monsoon-banner-dismissed-at";
const REAPPEAR_HOURS = 24;
// Monsoon plantation window deadline
const DEADLINE = new Date(`${new Date().getFullYear()}-08-31T23:59:59`);

function getCountdown() {
  const diff = DEADLINE.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return { days, hours };
}

export const MonsoonBanner = () => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown());
  const location = useLocation();

  useEffect(() => {
    // Only show during May–Sep (monsoon awareness window)
    const month = new Date().getMonth(); // 0-indexed
    if (month < 4 || month > 8) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (elapsed < REAPPEAR_HOURS) return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setCountdown(getCountdown()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [visible]);

  // Hide on checkout / admin / auth flows to avoid distraction
  const hiddenRoutes = ["/admin", "/auth", "/cart", "/checkout", "/marketplace/checkout"];
  if (hiddenRoutes.some((r) => location.pathname.startsWith(r))) return null;

  if (!visible || !countdown) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  return (
    <div className="relative z-50 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground border-b border-primary-foreground/10">
      <div className="container mx-auto px-3 py-2 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <CloudRain className="h-4 w-4 shrink-0 animate-pulse" aria-hidden />
        <Link
          to="/monsoon-plantation-himachal"
          className="flex-1 flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0"
        >
          <span className="font-semibold truncate">
            Monsoon Plantation Window Open
          </span>
          <span className="hidden sm:inline opacity-90">
            — Plant in Himachal by Aug 31 for 90%+ survival
          </span>
          <span className="hidden md:inline opacity-90 ml-auto pr-2">
            {countdown.days}d {countdown.hours}h left
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="p-1 rounded hover:bg-primary-foreground/10 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MonsoonBanner;
