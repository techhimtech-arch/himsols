import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  mrp?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  showSaveBadge?: boolean;
  className?: string;
  suffix?: string;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
};

const mrpSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
};

export const PriceDisplay = ({
  price,
  mrp,
  size = "md",
  showSaveBadge = true,
  className,
  suffix,
}: PriceDisplayProps) => {
  const hasDiscount = typeof mrp === "number" && mrp > price;
  const savings = hasDiscount ? Math.round((mrp as number) - price) : 0;

  return (
    <span className={cn("inline-flex items-baseline flex-wrap gap-x-2", className)}>
      {hasDiscount && (
        <span className={cn("text-muted-foreground line-through", mrpSizeClasses[size])}>
          ₹{mrp}
        </span>
      )}
      <span className={cn("font-bold text-primary", sizeClasses[size])}>
        ₹{price.toLocaleString()}
      </span>
      {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      {hasDiscount && showSaveBadge && (
        <span className="text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
          Save ₹{savings}
        </span>
      )}
    </span>
  );
};
