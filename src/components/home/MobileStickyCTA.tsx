import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export const MobileStickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl md:hidden animate-slide-up">
      <Link to="/single-tree-pack" className="block">
        <Button size="lg" className="w-full gap-2">
          <TreePine className="h-5 w-5" />
          Plant a Tree – ₹269
          <span className="text-xs opacity-80 line-through">₹299</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
};
