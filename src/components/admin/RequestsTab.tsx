import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";
import { Eye, User, Mail, Phone, MapPin, TreePine, Calendar, MessageSquare, Hash } from "lucide-react";

interface Request {
  id: string;
  tracking_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  tree_type: string;
  quantity: number;
  status: string;
  created_at: string;
  message: string | null;
}

interface RequestsTabProps {
  requests: Request[];
  onUpdateStatus: (requestId: string, newStatus: string) => Promise<void>;
}

export const RequestsTab = ({ requests, onUpdateStatus }: RequestsTabProps) => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Tree Plantation Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="block md:hidden space-y-4">
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No requests found</p>
            ) : (
              requests.map((request) => (
                <MobileCard key={request.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{request.tracking_id}</span>
                    <StatusBadge status={request.status} />
                  </div>
                  <MobileCardRow label="Name" value={request.name} />
                  <MobileCardRow label="Location" value={request.location} />
                  <MobileCardRow label="Tree Type" value={request.tree_type} />
                  <MobileCardRow label="Quantity" value={request.quantity} />
                  <MobileCardRow label="Date" value={new Date(request.created_at).toLocaleDateString()} />
                  
                  <div className="pt-2 border-t border-border space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Select
                      value={request.status}
                      onValueChange={(value) => onUpdateStatus(request.id, value)}
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
                  <TableHead>Location</TableHead>
                  <TableHead>Tree Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.tracking_id}</TableCell>
                      <TableCell>{request.name}</TableCell>
                      <TableCell>
                        <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                          {request.phone}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={request.location}>
                        {request.location}
                      </TableCell>
                      <TableCell>{request.tree_type}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={request.status}
                            onValueChange={(value) => onUpdateStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-[130px] bg-background">
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

      {/* Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary" />
              Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={selectedRequest.status} />
              </div>

              {/* Tracking ID */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Hash className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Tracking ID</p>
                  <p className="font-mono font-medium">{selectedRequest.tracking_id}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Customer Information</h4>
                
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedRequest.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedRequest.phone}`} className="font-medium text-primary hover:underline">
                      {selectedRequest.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedRequest.email}`} className="font-medium text-primary hover:underline break-all">
                      {selectedRequest.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Plantation Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Plantation Details</h4>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedRequest.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TreePine className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tree Type</p>
                    <p className="font-medium">{selectedRequest.tree_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedRequest.quantity} trees</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Request Date
                    </p>
                    <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Message/Notes */}
              {selectedRequest.message && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Notes
                  </h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t flex gap-2">
                <a href={`tel:${selectedRequest.phone}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </a>
                <a href={`mailto:${selectedRequest.email}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
