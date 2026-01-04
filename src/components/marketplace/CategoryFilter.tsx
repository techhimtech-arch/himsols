import { Button } from "@/components/ui/button";
import { Apple, Leaf, Home, Sparkles } from "lucide-react";

type MarketplaceCategory = "farmer_produce" | "value_added" | "plants_gardening" | "home_utility";

interface CategoryFilterProps {
  selectedCategory: MarketplaceCategory | null;
  onSelectCategory: (category: MarketplaceCategory | null) => void;
}

const categories: { id: MarketplaceCategory | null; label: string; icon: typeof Sparkles }[] = [
  { id: null, label: "All Products", icon: Sparkles },
  { id: "farmer_produce", label: "Farmer Produce", icon: Apple },
  { id: "value_added", label: "Value Added", icon: Sparkles },
  { id: "plants_gardening", label: "Plants & Garden", icon: Leaf },
  { id: "home_utility", label: "Home & Utility", icon: Home },
];

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id ?? "all"}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};
