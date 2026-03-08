import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Loader2, FileSpreadsheet, User, TreeDeciduous, Phone, Mail } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  tree_id: string;
  quantity: number;
  total_price: number;
  status: string;
  delivery_location: string;
  notes: string | null;
  created_at: string;
  state: string | null;
  district: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface Tree {
  id: string;
  name: string;
}

export const OrdersTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterState, setFilterState] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, email, phone");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: trees = [] } = useQuery({
    queryKey: ["admin-trees-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trees").select("id, name");
      if (error) throw error;
      return data as Tree[];
    },
  });

  const getUserInfo = (userId: string) => profiles.find(p => p.id === userId);
  const getTreeName = (treeId: string) => trees.find(t => t.id === treeId)?.name || "Unknown Tree";

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus as any }).eq("id", orderId);
      if (error) throw error;
      toast({ title: "Success", description: "Order status updated." });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterState !== "all" && order.state !== filterState) return false;
      if (filterDistrict !== "all" && order.district !== filterDistrict) return false;
      return true;
    });
  }, [orders, filterState, filterDistrict]);

  const availableDistricts = useMemo(() => {
    if (filterState === "all") return [];
    return getDistrictsForState(filterState as IndianState);
  }, [filterState]);

  const handleDownloadCertificate = async (orderId: string) => {
    setDownloadingCert(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Error", description: "Please login", variant: "destructive" }); return; }
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ orderId }) }
      );
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || "Failed"); }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `HIMSOLS-Certificate-${orderId.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      toast({ title: "Certificate Generated", description: "Downloaded successfully!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setDownloadingCert(null); }
  };

  const exportToExcel = () => {
    const headers = ["Order ID","Customer Name","Email","Phone","Tree Name","Quantity","Total Price (₹)","State","District","Delivery Location","Status","Order Date","Notes"];
    const rows = filteredOrders.map(order => {
      const user = getUserInfo(order.user_id);
      return [order.id.slice(0, 8).toUpperCase(), user?.full_name || "Unknown", user?.email || "-", user?.phone || "-", getTreeName(order.tree_id), order.quantity, order.total_price, order.state || "-", order.district || "-", order.delivery_location, order.status.replace(/_/g, " ").toUpperCase(), new Date(order.created_at).toLocaleDateString("en-IN"), order.notes || "-"];
    });
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `HIMSOLS-Orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
    toast({ title: "Export Successful", description: `${filteredOrders.length} orders exported` });
  };

  if (ordersLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-lg md:text-xl">Tree Orders ({filteredOrders.length})</CardTitle>
            <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filterState} onValueChange={(v) => { setFilterState(v); setFilterDistrict("all"); }}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background"><SelectValue placeholder="Filter by State" /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">All States</SelectItem>
                {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {filterState !== "all" && (
              <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background"><SelectValue placeholder="Filter by District" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="all">All Districts</SelectItem>
                  {availableDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          ) : (
            filteredOrders.map((order) => {
              const user = getUserInfo(order.user_id);
              return (
                <MobileCard key={order.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">#{order.id.slice(0, 8)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 mb-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium"><User className="h-3 w-3 text-primary" />{user?.full_name || "Unknown"}</div>
                    {user?.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{user.phone}</div>}
                    {user?.email && <div className="flex items-center gap-2 text-xs text-muted-foreground truncate"><Mail className="h-3 w-3" />{user.email}</div>}
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-sm"><TreeDeciduous className="h-4 w-4 text-primary" /><span className="font-medium">{getTreeName(order.tree_id)}</span></div>
                  <MobileCardRow label="Quantity" value={order.quantity} />
                  <MobileCardRow label="Total" value={`₹${order.total_price}`} />
                  <MobileCardRow label="State" value={order.state || "-"} />
                  <MobileCardRow label="District" value={order.district || "-"} />
                  <MobileCardRow label="Location" value={order.delivery_location} />
                  <MobileCardRow label="Date" value={new Date(order.created_at).toLocaleDateString()} />
                  {order.notes && <MobileCardRow label="Notes" value={order.notes} />}
                  <div className="pt-2 border-t border-border">
                    <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="site_verified">Site Verified</SelectItem>
                        <SelectItem value="saplings_arranged">Saplings Arranged</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {order.status === "completed" && (
                      <Button onClick={() => handleDownloadCertificate(order.id)} disabled={downloadingCert === order.id} className="w-full mt-2" size="sm" variant="outline">
                        {downloadingCert === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Award className="h-4 w-4 mr-1" /> Certificate</>}
                      </Button>
                    )}
                  </div>
                </MobileCard>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tree</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">No orders found</TableCell></TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const user = getUserInfo(order.user_id);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium flex items-center gap-1"><User className="h-3 w-3 text-primary" />{user?.full_name || "Unknown"}</div>
                          {user?.phone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</div>}
                          {user?.email && <div className="text-xs text-muted-foreground flex items-center gap-1 max-w-[150px] truncate"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{user.email}</span></div>}
                        </div>
                      </TableCell>
                      <TableCell><div className="flex items-center gap-1"><TreeDeciduous className="h-4 w-4 text-primary" />{getTreeName(order.tree_id)}</div></TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>₹{order.total_price}</TableCell>
                      <TableCell>{order.state || "-"}</TableCell>
                      <TableCell>{order.district || "-"}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={order.delivery_location}>{order.delivery_location}</TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                            <SelectTrigger className="w-[130px] bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-popover border border-border z-50">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="site_verified">Site Verified</SelectItem>
                              <SelectItem value="saplings_arranged">Saplings Arranged</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          {order.status === "completed" && (
                            <Button onClick={() => handleDownloadCertificate(order.id)} disabled={downloadingCert === order.id} size="sm" variant="outline" title="Generate Certificate">
                              {downloadingCert === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
