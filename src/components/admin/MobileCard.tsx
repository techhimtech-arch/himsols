import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
}

interface MobileCardRowProps {
  label: string;
  value: ReactNode;
}

export const MobileCard = ({ children, className = "" }: MobileCardProps) => {
  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="p-4 space-y-3">
        {children}
      </CardContent>
    </Card>
  );
};

export const MobileCardRow = ({ label, value }: MobileCardRowProps) => {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
