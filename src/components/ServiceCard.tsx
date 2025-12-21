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
      <CardContent className="p-8 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float"
          style={{
            background: `linear-gradient(135deg, ${color}, hsl(from ${color} h s calc(l * 1.2)))`,
            boxShadow: `0 8px 32px ${color}40`
          }}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};
