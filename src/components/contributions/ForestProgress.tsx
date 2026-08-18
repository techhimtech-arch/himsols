import { Check, Loader2 } from "lucide-react";

const STAGES = [
  { key: "pending", label: "Request received" },
  { key: "site_verified", label: "Site verified" },
  { key: "saplings_arranged", label: "Saplings arranged" },
  { key: "scheduled", label: "Plantation scheduled" },
  { key: "in_progress", label: "Planting" },
  { key: "completed", label: "Planted & tracked" },
] as const;

interface ForestProgressProps {
  status: string;
  compact?: boolean;
}

export const ForestProgress = ({ status, compact = false }: ForestProgressProps) => {
  if (status === "cancelled") {
    return (
      <p className="text-xs font-medium text-destructive">This request was cancelled.</p>
    );
  }

  const currentIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.key === status)
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center gap-1">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={stage.key} className="flex-1 flex items-center gap-1">
              <div
                className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary/15 text-primary ring-2 ring-primary/40"
                      : "bg-muted text-muted-foreground"
                }`}
                title={stage.label}
              >
                {done ? (
                  <Check className="h-3 w-3" />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  i + 1
                )}
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`h-1 flex-1 rounded-full ${i < currentIndex ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs font-medium text-foreground">
        Stage {currentIndex + 1} of {STAGES.length} · {STAGES[currentIndex].label}
      </p>
    </div>
  );
};

export default ForestProgress;
