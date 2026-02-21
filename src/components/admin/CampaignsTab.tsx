import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Target, Users, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { MobileCard } from "./MobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

type CampaignStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

interface Campaign {
  id: string;
  title: string;
  description: string;
  banner_image: string | null;
  goal_amount: number;
  collected_amount: number;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  show_on_homepage: boolean;
  allow_direct_payment: boolean;
  allow_gift_card: boolean;
  price_per_tree: number | null;
  sort_order: number;
  created_at: string;
}

interface CampaignFormData {
  title: string;
  description: string;
  banner_image: string;
  goal_amount: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  show_on_homepage: boolean;
  allow_direct_payment: boolean;
  allow_gift_card: boolean;
  price_per_tree: string;
  sort_order: string;
}

const defaultFormData: CampaignFormData = {
  title: "",
  description: "",
  banner_image: "",
  goal_amount: "10000",
  status: "INACTIVE",
  start_date: "",
  end_date: "",
  show_on_homepage: false,
  allow_direct_payment: true,
  allow_gift_card: false,
  price_per_tree: "99",
  sort_order: "0",
};

export const CampaignsTab = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>(defaultFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const { data: donationStats = {} } = useQuery({
    queryKey: ["campaign-donation-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("campaign_id, amount, payment_status");
      if (error) throw error;
      
      const stats: Record<string, { total: number; count: number }> = {};
      data?.forEach((d) => {
        if (d.campaign_id && d.payment_status === 'SUCCESS') {
          if (!stats[d.campaign_id]) {
            stats[d.campaign_id] = { total: 0, count: 0 };
          }
          stats[d.campaign_id].total += Number(d.amount);
          stats[d.campaign_id].count += 1;
        }
      });
      return stats;
    },
  });

  const { data: campaignDonors = [] } = useQuery({
    queryKey: ["campaign-donors", selectedCampaign?.id],
    enabled: !!selectedCampaign,
    queryFn: async () => {
      if (!selectedCampaign) return [];
      const { data, error } = await supabase
        .from("donations")
        .select("donor_name, donor_email, amount, payment_mode, created_at")
        .eq("campaign_id", selectedCampaign.id)
        .eq("payment_status", "SUCCESS")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const payload = {
        title: data.title,
        description: data.description,
        banner_image: data.banner_image || null,
        goal_amount: parseFloat(data.goal_amount) || 0,
        status: data.status,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        show_on_homepage: data.show_on_homepage,
        allow_direct_payment: data.allow_direct_payment,
        allow_gift_card: data.allow_gift_card,
        price_per_tree: parseFloat(data.price_per_tree) || 99,
        sort_order: parseInt(data.sort_order) || 0,
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from("campaigns")
          .update(payload)
          .eq("id", editingCampaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campaigns").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast({ title: editingCampaign ? "Campaign updated!" : "Campaign created!" });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast({ title: "Campaign deleted!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CampaignStatus }) => {
      const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast({ title: "Status updated!" });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCampaign(null);
    setFormData(defaultFormData);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      banner_image: campaign.banner_image || "",
      goal_amount: campaign.goal_amount.toString(),
      status: campaign.status,
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
      show_on_homepage: campaign.show_on_homepage,
      allow_direct_payment: campaign.allow_direct_payment,
      allow_gift_card: campaign.allow_gift_card,
      price_per_tree: (campaign.price_per_tree || 99).toString(),
      sort_order: campaign.sort_order.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const variants: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      COMPLETED: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getProgress = (campaign: Campaign) => {
    if (campaign.goal_amount <= 0) return 0;
    return Math.min(100, (campaign.collected_amount / campaign.goal_amount) * 100);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(defaultFormData)}>
              <Plus className="h-4 w-4 mr-2" /> Add Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Banner Image URL</Label>
                  <Input
                    value={formData.banner_image}
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label>Goal Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Label>Price Per Tree (₹)</Label>
                  <Input
                    type="number"
                    value={formData.price_per_tree}
                    onChange={(e) => setFormData({ ...formData, price_per_tree: e.target.value })}
                    min="1"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as CampaignStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Show on Homepage</Label>
                  <Switch
                    checked={formData.show_on_homepage}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_on_homepage: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow Direct Payment</Label>
                  <Switch
                    checked={formData.allow_direct_payment}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_direct_payment: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow Gift Card (Future)</Label>
                  <Switch
                    checked={formData.allow_gift_card}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_gift_card: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Campaign"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              {selectedCampaign.banner_image && (
                <img
                  src={selectedCampaign.banner_image}
                  alt={selectedCampaign.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{selectedCampaign.title}</h3>
                {getStatusBadge(selectedCampaign.status)}
              </div>
              <p className="text-muted-foreground">{selectedCampaign.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>₹{selectedCampaign.collected_amount.toLocaleString()} / ₹{selectedCampaign.goal_amount.toLocaleString()}</span>
                </div>
                <Progress value={getProgress(selectedCampaign)} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Trees: {Math.floor(selectedCampaign.collected_amount / (selectedCampaign.price_per_tree || 99))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Contributors: {donationStats[selectedCampaign.id]?.count || 0}</span>
                </div>
              </div>

              {campaignDonors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" /> Contributors List
                  </h4>
                  <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                    {campaignDonors.map((donor, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium">{donor.donor_name || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground">{donor.donor_email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{Number(donor.amount).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {donor.payment_mode === 'GIFT_CARD' ? 'Gift Card' : String(donor.payment_mode) === 'WALLET' ? 'Wallet' : 'Direct'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Created: {format(new Date(selectedCampaign.created_at), "dd MMM yyyy")}</p>
                {selectedCampaign.start_date && <p>Start: {selectedCampaign.start_date}</p>}
                {selectedCampaign.end_date && <p>End: {selectedCampaign.end_date}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Campaigns List */}
      {isMobile ? (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <MobileCard key={campaign.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    ₹{campaign.collected_amount.toLocaleString()} / ₹{campaign.goal_amount.toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(campaign.status)}
              </div>
              <Progress value={getProgress(campaign)} className="h-2" />
              <div className="flex gap-2 mt-2">
                {campaign.show_on_homepage && <Badge variant="outline">Homepage</Badge>}
                {campaign.allow_direct_payment && <Badge variant="outline">Payments</Badge>}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleViewDetails(campaign)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(campaign)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(campaign.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Homepage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {donationStats[campaign.id]?.count || 0} contributors
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="text-sm mb-1">
                          ₹{campaign.collected_amount.toLocaleString()} / ₹{campaign.goal_amount.toLocaleString()}
                        </div>
                        <Progress value={getProgress(campaign)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleStatusMutation.mutate({ id: campaign.id, status: campaign.status })}
                      >
                        {getStatusBadge(campaign.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={campaign.show_on_homepage}
                        onCheckedChange={async (checked) => {
                          await supabase
                            .from("campaigns")
                            .update({ show_on_homepage: checked })
                            .eq("id", campaign.id);
                          queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleViewDetails(campaign)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(campaign)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {campaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No campaigns yet. Create your first campaign!
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
