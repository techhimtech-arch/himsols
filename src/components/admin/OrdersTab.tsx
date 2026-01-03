import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Loader2 } from "lucide-react";

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

interface OrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export const OrdersTab = ({ orders, onUpdateStatus }: OrdersTabProps) => {
  const { toast } = useToast();
  const [filterState, setFilterState] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

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
      if (!session) {
        toast({
          title: "Error",
          description: "Please login to download certificate",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate certificate");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HIMSOLS-Certificate-${orderId.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Certificate Generated",
        description: "Certificate has been downloaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setDownloadingCert(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-lg md:text-xl">Tree Orders</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={filterState}
              onValueChange={(value) => {
                setFilterState(value);
                setFilterDistrict("all");
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">All States</SelectItem>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterState !== "all" && (
              <Select
                value={filterDistrict}
                onValueChange={setFilterDistrict}
              >
                <SelectTrigger className="w-full sm:w-[160px] bg-background">
                  <SelectValue placeholder="Filter by District" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="all">All Districts</SelectItem>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
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
            filteredOrders.map((order) => (
              <MobileCard key={order.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">#{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <MobileCardRow label="Quantity" value={order.quantity} />
                <MobileCardRow label="Total" value={`₹${order.total_price}`} />
                <MobileCardRow label="State" value={order.state || "-"} />
                <MobileCardRow label="District" value={order.district || "-"} />
                <MobileCardRow label="Location" value={order.delivery_location} />
                <MobileCardRow label="Date" value={new Date(order.created_at).toLocaleDateString()} />
                <div className="pt-2 border-t border-border">
                  <Select
                    value={order.status}
                    onValueChange={(value) => onUpdateStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
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
                    <Button
                      onClick={() => handleDownloadCertificate(order.id)}
                      disabled={downloadingCert === order.id}
                      className="w-full mt-2"
                      size="sm"
                      variant="outline"
                    >
                      {downloadingCert === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-1" />
                          Certificate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </MobileCard>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Price</TableHead>
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
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>₹{order.total_price}</TableCell>
                    <TableCell>{order.state || "-"}</TableCell>
                    <TableCell>{order.district || "-"}</TableCell>
                    <TableCell>{order.delivery_location}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => onUpdateStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
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
                          <Button
                            onClick={() => handleDownloadCertificate(order.id)}
                            disabled={downloadingCert === order.id}
                            size="sm"
                            variant="outline"
                            title="Generate Certificate"
                          >
                            {downloadingCert === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Award className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
