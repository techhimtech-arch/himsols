import { Card, CardContent } from "@/components/ui/card";
import { CloudRain, Leaf, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CO2ImpactCardProps {
  totalAllocated: number;
  survivalRate: number;
  co2PerTreeKg?: number;
}

export const CO2ImpactCard = ({ totalAllocated, survivalRate, co2PerTreeKg = 22 }: CO2ImpactCardProps) => {
  const estimatedCO2 = Math.round(totalAllocated * (survivalRate / 100) * co2PerTreeKg);
  const equivalentCarTrips = Math.round(estimatedCO2 / 4.6); // avg 4.6kg CO2 per 20km trip

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <CloudRain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated CO₂ Offset</p>
              <p className="text-3xl font-bold text-foreground">{estimatedCO2} <span className="text-base font-normal text-muted-foreground">kg/year</span></p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Indicative estimate: {totalAllocated} allocated trees × {survivalRate}% survival × {co2PerTreeKg} kg CO₂/tree/year.
                  Actual sequestration varies by species, age, and conditions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-primary" />
          <span>≈ {equivalentCarTrips} short car trips offset annually</span>
        </div>
      </CardContent>
    </Card>
  );
};
