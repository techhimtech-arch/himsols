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
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Valuable Scrap Collection Requests</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filterState}
              onValueChange={(value) => {
                setFilterState(value);
                setFilterDistrict("all");
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by District" />
                </SelectTrigger>
                <SelectContent>
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
        <div className="overflow-x-auto">
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
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {request.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => onUpdateStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
