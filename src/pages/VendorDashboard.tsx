import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Recycle, Wallet, Package, CheckCircle2 } from "lucide-react";

interface ScrapRequest {
  id: string;
  tracking_id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  pickup_date: string;
  waste_type: string;
  estimated_quantity: string | null;
  status: string;
  state: string | null;
  district: string | null;
  created_at: string;
}

const STATUSES = [
  "pending",
  "site_verified",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  site_verified: "bg-blue-500/20 text-blue-700",
  scheduled: "bg-indigo-500/20 text-indigo-700",
  in_progress: "bg-orange-500/20 text-orange-700",
  completed: "bg-green-500/20 text-green-700",
  cancelled: "bg-red-500/20 text-red-700",
};

export default function VendorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [creditFor, setCreditFor] = useState<ScrapRequest | null>(null);
  const [creditKg, setCreditKg] = useState("");
  const [creditRate, setCreditRate] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; note?: string }>({});

  // Auto-calc amount from kg × rate (unless user manually edited amount)
  useEffect(() => {
    if (amountTouched) return;
    const kg = parseFloat(creditKg);
    const rate = parseFloat(creditRate);
    if (kg > 0 && rate > 0) {
      setCreditAmount((kg * rate).toFixed(2));
    } else {
      setCreditAmount("");
    }
  }, [creditKg, creditRate, amountTouched]);

  const resetCreditForm = () => {
    setCreditFor(null);
    setCreditKg("");
    setCreditRate("");
    setCreditAmount("");
    setCreditNote("");
    setAmountTouched(false);
    setErrors({});
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const [vendor, admin] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: "scrap_vendor" }),
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      ]);
      setAuthorized(Boolean(vendor.data) || Boolean(admin.data));
    })();
  }, [user, authLoading, navigate]);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("waste_management_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRequests((data || []) as ScrapRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authorized) loadRequests();
  }, [authorized]);

  const filtered = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const inProgress = requests.filter((r) =>
      ["site_verified", "scheduled", "in_progress"].includes(r.status)
    ).length;
    const completed = requests.filter((r) => r.status === "completed").length;
    return { total, pending, inProgress, completed };
  }, [requests]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("waste_management_requests")
      .update({ status: status as any })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated", description: `Marked as ${status.replace("_", " ")}` });
    loadRequests();
  };

  const validateCredit = () => {
    const newErrors: { amount?: string; note?: string } = {};
    const amount = parseFloat(creditAmount);
    if (!creditAmount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(amount)) {
      newErrors.amount = "Amount must be a valid number";
    } else if (amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (amount > 100000) {
      newErrors.amount = "Amount cannot exceed ₹1,00,000";
    }
    if (creditNote && creditNote.length > 500) {
      newErrors.note = "Note must be under 500 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitCredit = async () => {
    if (!creditFor) return;
    if (!validateCredit()) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields and try again",
        variant: "destructive",
      });
      return;
    }
    const amount = parseFloat(creditAmount);
    setSubmitting(true);
    const { data, error } = await supabase.rpc("credit_scrap_to_wallet", {
      p_request_id: creditFor.id,
      p_amount: amount,
      p_note: creditNote.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Credit failed", description: error.message, variant: "destructive" });
      return;
    }
    const newBal = (data as any)?.[0]?.new_balance;
    toast({
      title: "✅ Wallet Credited",
      description: `₹${amount} added. New balance: ₹${newBal ?? "-"}`,
    });
    // Auto-mark completed
    await supabase
      .from("waste_management_requests")
      .update({ status: "completed" as any })
      .eq("id", creditFor.id);
    resetCreditForm();
    loadRequests();
  };

  if (authLoading || authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-40 w-80" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 container mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                You need the <strong>Scrap Vendor</strong> role to view this dashboard.
                Contact an admin to request access.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 bg-muted/20">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex items-center gap-3">
            <Recycle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage scrap pickups and credit user wallets
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Package />} label="Total" value={stats.total} />
            <StatCard icon={<Package />} label="Pending" value={stats.pending} />
            <StatCard icon={<Recycle />} label="In Progress" value={stats.inProgress} />
            <StatCard icon={<CheckCircle2 />} label="Completed" value={stats.completed} />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Label>Filter:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadRequests}>
              Refresh
            </Button>
          </div>

          {/* Requests list */}
          {loading ? (
            <Skeleton className="h-60 w-full" />
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No requests found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filtered.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold">
                            {r.tracking_id}
                          </span>
                          <Badge className={statusColor[r.status] || ""}>
                            {r.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="font-semibold">
                          {r.name} · {r.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">{r.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.waste_type} · {r.estimated_quantity || "?"} kg ·
                          Pickup: {new Date(r.pickup_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 md:w-56">
                        <Select
                          value={r.status}
                          onValueChange={(v) => updateStatus(r.id, v)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => setCreditFor(r)}
                          className="gap-2"
                        >
                          <Wallet className="h-4 w-4" />
                          Credit Wallet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Credit Dialog */}
      <Dialog open={!!creditFor} onOpenChange={(o) => !o && setCreditFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Wallet</DialogTitle>
          </DialogHeader>
          {creditFor && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p>
                  <strong>Request:</strong> {creditFor.tracking_id}
                </p>
                <p>
                  <strong>User:</strong> {creditFor.name} ({creditFor.phone})
                </p>
              </div>
              <div className="space-y-2">
                <Label>Credit Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="e.g. 250"
                />
              </div>
              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Input
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="Collected 12kg paper @ ₹20/kg"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditFor(null)}>
              Cancel
            </Button>
            <Button onClick={submitCredit} disabled={submitting}>
              {submitting ? "Crediting..." : "Confirm & Credit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
