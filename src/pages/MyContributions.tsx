import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Heart, TreePine, ArrowRight, Wallet, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/admin/MobileCard";

interface Donation {
  id: string;
  amount: number;
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  payment_mode: 'DIRECT' | 'GIFT_CARD';
  created_at: string;
  campaigns: {
    id: string;
    title: string;
    price_per_tree: number | null;
  } | null;
}

const MyContributions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadCertificate = async (donationId: string) => {
    setDownloadingId(donationId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
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

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["my-contributions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("donations")
        .select(`
          id,
          amount,
          payment_status,
          payment_mode,
          created_at,
          campaigns(id, title, price_per_tree)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Donation[];
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      SUCCESS: { variant: "default", label: "Successful" },
      FAILED: { variant: "destructive", label: "Failed" },
      REFUNDED: { variant: "outline", label: "Refunded" },
    };
    const c = config[status] || config.PENDING;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const totalContributed = donations
    .filter((d) => d.payment_status === 'SUCCESS')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalTrees = donations
    .filter((d) => d.payment_status === 'SUCCESS')
    .reduce((sum, d) => {
      const pricePerTree = d.campaigns?.price_per_tree || 99;
      return sum + Math.floor(Number(d.amount) / pricePerTree);
    }, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-16 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6">
            Please login to view your contributions.
          </p>
          <Button onClick={() => navigate("/auth")}>
            Login Now
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Contributions | Himsols" description="View your campaign contributions and impact." />
      <Navbar />
      
      <main className="pt-20 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Contributions</h1>
            <p className="text-muted-foreground">Track your impact and donation history</p>
          </div>
          <Button onClick={() => navigate("/campaigns")}>
            Support More Campaigns
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{totalContributed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Contributed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TreePine className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTrees}</p>
                  <p className="text-sm text-muted-foreground">Trees Planted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{donations.filter(d => d.payment_status === 'SUCCESS').length}</p>
                  <p className="text-sm text-muted-foreground">Campaigns Supported</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contributions Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Contributions Yet</h2>
              <p className="text-muted-foreground mb-4">
                Start supporting campaigns to make an impact!
              </p>
              <Button onClick={() => navigate("/campaigns")}>
                Explore Campaigns
              </Button>
            </CardContent>
          </Card>
        ) : isMobile ? (
          <div className="space-y-3">
            {donations.map((donation) => (
              <MobileCard key={donation.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{donation.campaigns?.title || "General Donation"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(donation.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                  {getStatusBadge(donation.payment_status)}
                </div>
                 <div className="flex justify-between items-center mt-2">
                   <span className="text-xs text-muted-foreground">{donation.payment_mode}</span>
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
                         Certificate
                       </Button>
                     )}
                     <span className="font-bold text-primary">₹{Number(donation.amount).toLocaleString()}</span>
                   </div>
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
                     <TableHead>Campaign</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead>Trees</TableHead>
                     <TableHead>Mode</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Date</TableHead>
                     <TableHead>Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => {
                    const pricePerTree = donation.campaigns?.price_per_tree || 99;
                    const trees = Math.floor(Number(donation.amount) / pricePerTree);
                    return (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">
                          {donation.campaigns?.title || "General Donation"}
                        </TableCell>
                        <TableCell className="font-bold">
                          ₹{Number(donation.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TreePine className="h-4 w-4 text-green-600" />
                            {trees}
                          </div>
                        </TableCell>
                        <TableCell>{donation.payment_mode}</TableCell>
                        <TableCell>{getStatusBadge(donation.payment_status)}</TableCell>
                         <TableCell>
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
                               Download
                             </Button>
                           ) : (
                             <span className="text-muted-foreground text-sm">—</span>
                           )}
                         </TableCell>
                       </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyContributions;
