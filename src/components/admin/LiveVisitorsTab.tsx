import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Eye, TrendingUp, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Visit {
  visitor_id: string;
  page_path: string;
  visited_at: string;
}

export const LiveVisitorsTab = () => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["live-visitors"],
    queryFn: async () => {
      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("site_visitors")
        .select("visitor_id, page_path, visited_at")
        .gte("visited_at", since7d)
        .order("visited_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []) as Visit[];
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const visits = data || [];
  const now = Date.now();
  const last5min = visits.filter((v) => now - new Date(v.visited_at).getTime() < 5 * 60 * 1000);
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const today = visits.filter((v) => new Date(v.visited_at) >= startOfToday);
  const last24h = visits.filter((v) => now - new Date(v.visited_at).getTime() < 24 * 60 * 60 * 1000);

  const onlineNow = new Set(last5min.map((v) => v.visitor_id)).size;
  const uniqueToday = new Set(today.map((v) => v.visitor_id)).size;
  const unique7d = new Set(visits.map((v) => v.visitor_id)).size;
  const pageViewsToday = today.length;

  // Top pages last 24h
  const pageCount: Record<string, number> = {};
  last24h.forEach((v) => {
    const p = v.page_path || "/";
    pageCount[p] = (pageCount[p] || 0) + 1;
  });
  const topPages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Daily breakdown last 7 days
  const dailyCount: Record<string, Set<string>> = {};
  visits.forEach((v) => {
    const day = new Date(v.visited_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    if (!dailyCount[day]) dailyCount[day] = new Set();
    dailyCount[day].add(v.visitor_id);
  });
  const dailyArr = Object.entries(dailyCount).map(([d, set]) => ({ day: d, count: set.size }));
  const maxDaily = Math.max(...dailyArr.map((d) => d.count), 1);

  const stats = [
    { label: "Online Now (5 min)", value: onlineNow, icon: Activity, color: "text-green-600" },
    { label: "Unique Today", value: uniqueToday, icon: Users, color: "text-primary" },
    { label: "Page Views Today", value: pageViewsToday, icon: Eye, color: "text-blue-600" },
    { label: "Unique (7 days)", value: unique7d, icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Visitors</h2>
          <p className="text-sm text-muted-foreground">
            Auto-refreshes every 30s {isFetching && "• updating…"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-7 w-7 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Pages (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map(([path, count]) => (
                    <TableRow key={path}>
                      <TableCell className="font-mono text-xs truncate max-w-[260px]">{path}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary">{count}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Unique Visitors (7 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dailyArr.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : dailyArr.map((d) => (
              <div key={d.day} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{d.day}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(d.count / maxDaily) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity (last 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Visitor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.slice(0, 50).map((v, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(v.visited_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[280px]">{v.page_path || "/"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {v.visitor_id.slice(0, 10)}…
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
