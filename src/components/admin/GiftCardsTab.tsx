import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, Search, Plus, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { BulkGiftCardUpload } from "./BulkGiftCardUpload";

export const GiftCardsTab = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCard, setNewCard] = useState({
    value: "",
    recipientName: "",
    recipientEmail: "",
    giftMessage: "",
    occasion: "",
  });

  const OCCASIONS = [
    { id: "birthday", label: "🎂 Birthday", message: "Wishing you a very Happy Birthday! 🎉 May this green gift bring joy to you and our planet." },
    { id: "wedding", label: "💒 Wedding", message: "Congratulations on your wedding! 💐 May your new journey together be as evergreen as the trees planted in your name." },
    { id: "valentine", label: "❤️ Valentine", message: "Happy Valentine's Day! 🌹 A gift of love for you and for Mother Earth." },
    { id: "festival", label: "🪔 Festival", message: "Wishing you a joyous festival season! 🎊 Celebrate with a gift that gives back to nature." },
  ];
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: giftCards = [], isLoading } = useQuery({
    queryKey: ["admin-gift-cards", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("gift_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredCards = giftCards.filter((card: any) =>
    card.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.purchaser_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGiftCard = async () => {
    const amount = parseFloat(newCard.value);
    if (!amount || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount (minimum ₹1)",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Generate code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_gift_card_code');

      if (codeError) throw codeError;

      // Insert gift card directly (admin bypass - no payment)
      const { error: insertError } = await supabase
        .from("gift_cards")
        .insert({
          code: codeData,
          value: amount,
          balance: amount,
          status: "active",
          recipient_name: newCard.recipientName || null,
          recipient_email: newCard.recipientEmail || null,
          gift_message: newCard.giftMessage || null,
          occasion: newCard.occasion || null,
          purchaser_name: "Admin",
          purchaser_email: "admin@himsols.online",
          payment_gateway: "admin_created",
          payment_id: `admin_${Date.now()}`,
        });

      if (insertError) throw insertError;

      toast({
        title: "Gift Card Created! 🎁",
        description: `Code: ${codeData} - Value: ₹${amount.toLocaleString()}`,
      });

      setNewCard({ value: "", recipientName: "", recipientEmail: "", giftMessage: "", occasion: "" });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-gift-cards"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "redeemed": return <Badge className="bg-blue-500">Redeemed</Badge>;
      case "expired": return <Badge variant="secondary">Expired</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Gift Cards Management
        </h2>
        
        <div className="flex gap-2">
          <BulkGiftCardUpload />
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Single
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Gift Card (Admin)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="value">Amount (₹) *</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="Enter amount"
                  value={newCard.value}
                  onChange={(e) => setNewCard({ ...newCard, value: e.target.value })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Occasion (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <Button
                      key={occ.id}
                      type="button"
                      size="sm"
                      variant={newCard.occasion === occ.id ? "default" : "outline"}
                      onClick={() => {
                        if (newCard.occasion === occ.id) {
                          setNewCard({ ...newCard, occasion: "", giftMessage: "" });
                        } else {
                          setNewCard({ ...newCard, occasion: occ.id, giftMessage: occ.message });
                        }
                      }}
                    >
                      {occ.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                <Input
                  id="recipientName"
                  placeholder="Enter recipient name"
                  value={newCard.recipientName}
                  onChange={(e) => setNewCard({ ...newCard, recipientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="Enter recipient email"
                  value={newCard.recipientEmail}
                  onChange={(e) => setNewCard({ ...newCard, recipientEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                <Textarea
                  id="giftMessage"
                  placeholder="Enter a personal message"
                  value={newCard.giftMessage}
                  onChange={(e) => setNewCard({ ...newCard, giftMessage: e.target.value })}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleCreateGiftCard} 
                className="w-full"
                disabled={isCreating || !newCard.value}
              >
                {isCreating ? "Creating..." : "Create Gift Card"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ This creates a gift card without payment (Admin only)
              </p>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code, email, or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="redeemed">Redeemed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Purchaser</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
                 </TableRow>
              ) : filteredCards.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                     No gift cards found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((card: any) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono font-medium">{card.code}</TableCell>
                    <TableCell>₹{card.value.toLocaleString()}</TableCell>
                    <TableCell>₹{card.balance.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(card.status)}</TableCell>
                    <TableCell className="text-sm">{card.purchaser_email || "-"}</TableCell>
                    <TableCell className="text-sm">{card.recipient_name || "-"}</TableCell>
                     <TableCell className="text-sm">{format(new Date(card.created_at), "dd MMM yyyy")}</TableCell>
                     <TableCell className="text-sm">{format(new Date(card.expires_at), "dd MMM yyyy")}</TableCell>
                     <TableCell>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
                         title="Share on WhatsApp"
                         onClick={() => {
                           const msg = `🎁 *Green Gift Card from Himsols!*\n\nCode: *${card.code}*\nValue: ₹${card.value.toLocaleString()}\n${card.recipient_name ? `For: ${card.recipient_name}\n` : ""}${card.gift_message ? `\n💌 ${card.gift_message}\n` : ""}\n🌿 Redeem at: ${window.location.origin}/redeem-gift-card`;
                           window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                         }}
                       >
                         <MessageCircle className="h-4 w-4" />
                       </Button>
                     </TableCell>
                   </TableRow>
                ))

              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
