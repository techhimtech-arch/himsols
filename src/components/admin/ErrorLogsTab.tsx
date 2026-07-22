import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface ErrorLog {
  id: string;
  user_id: string | null;
  message: string;
  stack: string | null;
  source: string | null;
  url: string | null;
  user_agent: string | null;
  severity: string;
  resolved: boolean;
  metadata: any;
  created_at: string;
}

export const ErrorLogsTab = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["error-logs", filter],
    queryFn: async () => {
      let q = supabase.from("client_error_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (filter === "unresolved") q = q.eq("resolved", false);
      if (filter === "resolved") q = q.eq("resolved", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ErrorLog[];
    },
    refetchInterval: 30_000,
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase.from("client_error_logs").update({ resolved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["error-logs"] }),
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_error_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["error-logs"] }),
  });

  const clearResolved = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("client_error_logs").delete().eq("resolved", true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Cleared resolved errors" });
      qc.invalidateQueries({ queryKey: ["error-logs"] });
    },
  });

  const counts = {
    all: logs.length,
    unresolved: logs.filter(l => !l.resolved).length,
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant={filter === "unresolved" ? "default" : "outline"} onClick={() => setFilter("unresolved")}>
            Unresolved
          </Button>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All
          </Button>
          <Button size="sm" variant={filter === "resolved" ? "default" : "outline"} onClick={() => setFilter("resolved")}>
            Resolved
          </Button>
        </div>
        <Button size="sm" variant="destructive" onClick={() => clearResolved.mutate()} disabled={clearResolved.isPending}>
          Clear resolved
        </Button>
      </div>

      {logs.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-primary" />
          No errors {filter === "unresolved" ? "to fix" : "found"} 🎉
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className={log.resolved ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      <Badge variant={log.severity === "error" ? "destructive" : "secondary"}>{log.severity}</Badge>
                      {log.resolved && <Badge variant="outline">resolved</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-mono text-sm break-all">{log.message}</p>
                    {log.url && <p className="text-xs text-muted-foreground mt-1 truncate">📍 {log.url}</p>}
                    {log.source && <p className="text-xs text-muted-foreground truncate">src: {log.source}</p>}

                    {expanded === log.id && (
                      <div className="mt-3 space-y-2 text-xs">
                        {log.stack && (
                          <pre className="bg-muted p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap">{log.stack}</pre>
                        )}
                        {log.user_agent && <p className="text-muted-foreground">UA: {log.user_agent}</p>}
                        {log.user_id && <p className="text-muted-foreground">User: {log.user_id}</p>}
                      </div>
                    )}

                    <button
                      className="text-xs text-primary mt-2 hover:underline"
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    >
                      {expanded === log.id ? "Hide details" : "Show details"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleResolved.mutate({ id: log.id, resolved: !log.resolved })}
                      title={log.resolved ? "Reopen" : "Mark resolved"}
                    >
                      {log.resolved ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteLog.mutate(log.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing latest 200. {counts.unresolved} unresolved.
      </p>
    </div>
  );
};
