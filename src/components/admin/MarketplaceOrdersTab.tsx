import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  seller_name?: string;
}

interface MarketplaceOrder {
  id: string;
  order_number: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  delivery_address: string;
  district: string | null;
  state: string | null;
  notes: string | null;
  status: RequestStatus;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  scheduled: "bg-indigo-100 text-indigo-700",
  site_verified: "bg-purple-100 text-purple-700",
  saplings_arranged: "bg-cyan-100 text-cyan-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const MarketplaceOrdersTab = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-marketplace-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[],
      })) as MarketplaceOrder[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
      const { error } = await supabase
        .from("marketplace_orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-marketplace-orders"] });
      toast.success("Order status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Marketplace Orders ({orders?.length || 0})</h3>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                <TableCell className="text-sm">
                  {format(new Date(order.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.items.length} items</span>
                </TableCell>
                <TableCell className="font-medium">₹{order.total_price}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.district}, {order.state}
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value: RequestStatus) =>
                      updateStatusMutation.mutate({ id: order.id, status: value })
                    }
                  >
                    <SelectTrigger className="w-28 h-8">
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Delivery Address</p>
                <p className="text-sm">
                  {selectedOrder.delivery_address}
                  <br />
                  {selectedOrder.district}, {selectedOrder.state}
                </p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <p className="text-muted-foreground text-sm mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-muted/50 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.seller_name && (
                          <p className="text-xs text-muted-foreground">by {item.seller_name}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p>
                          {item.quantity} {item.unit} × ₹{item.price}
                        </p>
                        <p className="font-medium">₹{item.quantity * item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-primary">
                  ₹{selectedOrder.total_price}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
