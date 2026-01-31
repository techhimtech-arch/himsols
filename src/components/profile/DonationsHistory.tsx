import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, TreePine, Calendar, IndianRupee } from "lucide-react";
import { format } from "date-fns";

interface Donation {
  id: string;
  amount: number;
  payment_status: string;
  payment_mode: string;
  created_at: string;
  campaign: {
    title: string;
    price_per_tree: number | null;
  } | null;
}

export const DonationsHistory = () => {
  const { user } = useAuth();

  const { data: donations, isLoading } = useQuery({
    queryKey: ["user-donations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select(`
          id,
          amount,
          payment_status,
          payment_mode,
          created_at,
          campaign:campaigns(title, price_per_tree)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Donation[];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500">Successful</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "REFUNDED":
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateTrees = (amount: number, pricePerTree: number | null) => {
    if (!pricePerTree || pricePerTree <= 0) return 0;
    return Math.floor(amount / pricePerTree);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No donations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your contribution history will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = donations
    .filter((d) => d.payment_status === "SUCCESS")
    .reduce((sum, d) => sum + d.amount, 0);

  const totalTrees = donations
    .filter((d) => d.payment_status === "SUCCESS")
    .reduce((sum, d) => sum + calculateTrees(d.amount, d.campaign?.price_per_tree || 99), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/10">
          <CardContent className="pt-4 text-center">
            <IndianRupee className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Donated</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10">
          <CardContent className="pt-4 text-center">
            <TreePine className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{totalTrees}</p>
            <p className="text-sm text-muted-foreground">Trees Planted</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation List */}
      <div className="space-y-3">
        {donations.map((donation) => (
          <Card key={donation.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">
                    {donation.campaign?.title || "General Donation"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(donation.created_at), "dd MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TreePine className="h-3 w-3 text-green-600" />
                    {calculateTrees(donation.amount, donation.campaign?.price_per_tree || 99)} trees
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-bold text-lg">₹{donation.amount.toLocaleString()}</p>
                  {getStatusBadge(donation.payment_status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
