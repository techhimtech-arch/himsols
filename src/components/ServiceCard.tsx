import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}

export const ServiceCard = ({ icon, title, description, color }: ServiceCardProps) => {
  return (
    <Card className="group hover:shadow-hover transition-all duration-500 cursor-pointer border-white/30 backdrop-blur-xl bg-white/50 overflow-hidden">
      <CardContent className="p-4 sm:p-6 md:p-8 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${color}, hsl(from ${color} h s calc(l * 1.2)))`,
            boxShadow: `0 8px 32px ${color}40`
          }}
        >
          {icon}
        </div>
        <h3 className="text-sm sm:text-base md:text-xl font-bold text-foreground mb-1 sm:mb-2 md:mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3 hidden sm:block">{description}</p>
      </CardContent>
    </Card>
  );
};
