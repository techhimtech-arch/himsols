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
import { useState, useMemo } from "react";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";

interface ScrapRequest {
  id: string;
  tracking_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pickup_date: string;
  waste_type: string;
  estimated_quantity: string | null;
  status: string;
  created_at: string;
  message: string | null;
  state: string | null;
  district: string | null;
}

interface ScrapRequestsTabProps {
  requests: ScrapRequest[];
  onUpdateStatus: (requestId: string, newStatus: string) => void;
}

export const ScrapRequestsTab = ({ requests, onUpdateStatus }: ScrapRequestsTabProps) => {
  const [filterState, setFilterState] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (filterState !== "all" && request.state !== filterState) return false;
      if (filterDistrict !== "all" && request.district !== filterDistrict) return false;
      return true;
    });
  }, [requests, filterState, filterDistrict]);

  const availableDistricts = useMemo(() => {
    if (filterState === "all") return [];
    return getDistrictsForState(filterState as IndianState);
  }, [filterState]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-lg md:text-xl">Valuable Scrap Collection Requests</CardTitle>
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
          {filteredRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No scrap collection requests found</p>
          ) : (
            filteredRequests.map((request) => (
              <MobileCard key={request.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">{request.tracking_id}</span>
                  <StatusBadge status={request.status} />
                </div>
                <MobileCardRow label="Name" value={request.name} />
                <MobileCardRow label="Phone" value={request.phone} />
                <MobileCardRow label="State" value={request.state || "-"} />
                <MobileCardRow label="District" value={request.district || "-"} />
                <MobileCardRow label="Address" value={<span className="line-clamp-2">{request.address}</span>} />
                <MobileCardRow label="Pickup Date" value={new Date(request.pickup_date).toLocaleDateString()} />
                <MobileCardRow label="Scrap Type" value={request.waste_type} />
                <MobileCardRow label="Quantity" value={request.estimated_quantity || "-"} />
                <div className="pt-2 border-t border-border">
                  <Select
                    value={request.status}
                    onValueChange={(value) => onUpdateStatus(request.id, value)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="site_verified">Verified</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
                <TableHead>Tracking ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Pickup Date</TableHead>
                <TableHead>Scrap Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                    No scrap collection requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.tracking_id}</TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{request.phone}</TableCell>
                    <TableCell>{request.state || "-"}</TableCell>
                    <TableCell>{request.district || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={request.address}>
                      {request.address}
                    </TableCell>
                    <TableCell>{new Date(request.pickup_date).toLocaleDateString()}</TableCell>
                    <TableCell>{request.waste_type}</TableCell>
                    <TableCell>{request.estimated_quantity || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => onUpdateStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-[150px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="site_verified">Verified</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
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
