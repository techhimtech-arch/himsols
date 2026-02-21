import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MobileCard } from "./MobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { IndianRupee, CreditCard, Gift, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
type PaymentMode = 'DIRECT' | 'GIFT_CARD';

interface Donation {
  id: string;
  campaign_id: string | null;
  user_id: string;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  payment_id: string | null;
  payment_gateway: string | null;
  created_at: string;
  campaigns?: { title: string } | null;
  profiles?: { full_name: string; email: string } | null;
}

interface Campaign {
  id: string;
  title: string;
}

export const DonationsTab = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin-campaigns-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["admin-donations", statusFilter, campaignFilter],
    queryFn: async () => {
      let query = supabase
        .from("donations")
        .select(`
          *,
          campaigns(title),
          profiles:user_id(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("payment_status", statusFilter as PaymentStatus);
      }
      if (campaignFilter !== "all") {
        query = query.eq("campaign_id", campaignFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Donation[];
    },
  });

  const handleDownloadCertificate = async (donationId: string) => {
    setDownloadingId(donationId);
    try {
      const response = await supabase.functions.invoke("generate-donation-certificate", {
        body: { donationId },
      });
      
      if (response.error) throw new Error(response.error.message);
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HIMSOLS-Donation-Certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Certificate Downloaded! 🎉" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      SUCCESS: { variant: "default", label: "Success" },
      FAILED: { variant: "destructive", label: "Failed" },
      REFUNDED: { variant: "outline", label: "Refunded" },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getPaymentModeIcon = (mode: PaymentMode) => {
    return mode === 'DIRECT' ? (
      <CreditCard className="h-4 w-4 text-blue-500" />
    ) : (
      <Gift className="h-4 w-4 text-purple-500" />
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading donations...</div>;
  }

  const totalAmount = donations
    .filter((d) => d.payment_status === 'SUCCESS')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Donations</h2>
          <p className="text-sm text-muted-foreground">
            Total Collected: <span className="font-semibold text-primary">₹{totalAmount.toLocaleString()}</span>
            {" · "}{donations.filter(d => d.payment_status === 'SUCCESS').length} successful
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {donations.map((donation) => (
            <MobileCard key={donation.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {donation.donor_name || donation.profiles?.full_name || "Anonymous"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {donation.campaigns?.title || "General Donation"}
                  </p>
                </div>
                {getStatusBadge(donation.payment_status)}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getPaymentModeIcon(donation.payment_mode)}
                  <span className="text-xs">{donation.payment_mode}</span>
                </div>
                <div className="flex items-center gap-2">
                  {donation.payment_status === 'SUCCESS' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      disabled={downloadingId === donation.id}
                      onClick={() => handleDownloadCertificate(donation.id)}
                    >
                      {downloadingId === donation.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    </Button>
                  )}
                  <span className="font-semibold text-primary">₹{Number(donation.amount).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(donation.created_at), "dd MMM yyyy, hh:mm a")}
              </div>
            </MobileCard>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {donation.donor_name || donation.profiles?.full_name || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {donation.donor_email || donation.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{donation.campaigns?.title || "—"}</TableCell>
                    <TableCell>
                      <span className="font-semibold">₹{Number(donation.amount).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPaymentModeIcon(donation.payment_mode)}
                        <span className="text-xs">{donation.payment_mode}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(donation.payment_status)}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(donation.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {donation.payment_status === 'SUCCESS' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1"
                          disabled={downloadingId === donation.id}
                          onClick={() => handleDownloadCertificate(donation.id)}
                        >
                          {downloadingId === donation.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                          PDF
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {donations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No donations yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};