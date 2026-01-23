import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, Recycle } from "lucide-react";
import { useEffect, useState } from "react";

export const MobileStickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl md:hidden animate-slide-up">
      <div className="flex gap-2">
        <Link to="/shop" className="flex-1">
          <Button size="sm" className="w-full gap-2 text-sm">
            <TreePine className="h-4 w-4" />
            Shop Trees
          </Button>
        </Link>
        <Link to="/waste-management" className="flex-1">
          <Button size="sm" variant="secondary" className="w-full gap-2 text-sm">
            <Recycle className="h-4 w-4" />
            Scrap Pickup
          </Button>
        </Link>
      </div>
    </div>
  );
};
