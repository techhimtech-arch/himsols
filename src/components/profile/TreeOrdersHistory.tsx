import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { TreePine, Calendar, IndianRupee, MapPin, Package } from "lucide-react";
import { format } from "date-fns";

interface TreeOrder {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  delivery_location: string | null;
  created_at: string;
  tree: { name: string } | null;
}

const statusBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "planted") return <Badge className="bg-green-600">Planted</Badge>;
  if (s === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
  if (s === "pending") return <Badge variant="secondary">Pending</Badge>;
  return <Badge variant="outline">{status?.replace("_", " ")}</Badge>;
};

export const TreeOrdersHistory = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["profile-tree-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, quantity, total_price, status, delivery_location, created_at, tree:trees(name)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as TreeOrder[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No tree orders yet</p>
          <Button asChild>
            <Link to="/climate-impact-pack">Plant your first trees</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const paid = orders.filter((o) => o.status?.toLowerCase() !== "cancelled");
  const totalAmount = paid.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalTrees = paid.reduce((sum, o) => sum + (o.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/10">
          <CardContent className="pt-4 text-center">
            <IndianRupee className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Contributed</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10">
          <CardContent className="pt-4 text-center">
            <TreePine className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{totalTrees}</p>
            <p className="text-sm text-muted-foreground">Trees Ordered</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{order.tree?.name || "Tree Plantation"}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(order.created_at), "dd MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TreePine className="h-3 w-3 text-green-600" />
                    {order.quantity} {order.quantity === 1 ? "tree" : "trees"}
                  </div>
                  {order.delivery_location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {order.delivery_location}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <p className="font-bold text-lg">₹{(order.total_price || 0).toLocaleString()}</p>
                  {statusBadge(order.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to="/order-history">View full order details & certificates</Link>
        </Button>
      </div>
    </div>
  );
};
