import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Search, Mail, Phone, Calendar, Eye, FileDown, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { generateSchoolOutreachPdf } from "@/lib/schoolOutreachPdf";

type Status = "new" | "contacted" | "scheduled" | "completed" | "cancelled";

interface SchoolPartnership {
  id: string;
  institution_name: string;
  institution_type: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  student_count: number | null;
  program_interest: string[];
  preferred_date: string | null;
  message: string | null;
  status: Status;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_COLOR: Record<Status, string> = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  scheduled: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
};

export const SchoolPartnershipsTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { settings } = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<SchoolPartnership | null>(null);
  const [notes, setNotes] = useState("");

  const contact = {
    phone: settings?.contact_phone || settings?.whatsapp_number,
    email: settings?.contact_email,
    website: "himsols.online",
  };

  const downloadKit = (institutionName: string | null) => {
    const pdf = generateSchoolOutreachPdf(institutionName, contact);
    const safe = (institutionName || "Himsols-Schools").replace(/[^a-z0-9]+/gi, "-");
    pdf.save(`${safe}-Outreach-Kit.pdf`);
  };

  const shareKitOnWhatsApp = (r: SchoolPartnership | null) => {
    const phone = r?.phone?.replace(/\D/g, "");
    const text = `Namaste${r?.contact_person ? " " + r.contact_person : ""},\n\nThank you for your interest in the Himsols Schools & Education Program${r?.institution_name ? " for " + r.institution_name : ""}. Please find our outreach kit attached (download from your email or ask us to resend).\n\nApply / details: https://himsols.online/schools\n\n— Himsols Team`;
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast({ title: "Tip", description: "Download the PDF first, then attach it in WhatsApp." });
  };

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-school-partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_partnerships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SchoolPartnership[];
    },
  });

  const filtered = rows.filter((r) => {
    const matchesSearch =
      r.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase
      .from("school_partnerships")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated" });
    qc.invalidateQueries({ queryKey: ["admin-school-partnerships"] });
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("school_partnerships")
      .update({ admin_notes: notes })
      .eq("id", selected.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Notes saved" });
    qc.invalidateQueries({ queryKey: ["admin-school-partnerships"] });
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          School Partnerships ({rows.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => downloadKit(null)} className="gap-2">
            <FileDown className="h-4 w-4" /> Download Outreach Kit (PDF)
          </Button>
          <Button variant="outline" onClick={() => shareKitOnWhatsApp(null)} className="gap-2 text-green-700">
            <MessageCircle className="h-4 w-4" /> Share on WhatsApp
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Use the kit to pitch schools, colleges and NGOs. Download the PDF, then open WhatsApp and attach it to the chat.
      </p>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institution, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Programs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No applications yet. Use the <span className="font-medium">Download Outreach Kit</span> button above to start pitching schools.
                </TableCell></TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(r.created_at), "dd MMM yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.institution_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{r.institution_type} · {r.city || "—"}{r.state ? `, ${r.state}` : ""}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{r.contact_person}</div>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="h-3 w-3" />{r.email}</a>
                        <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-muted-foreground hover:underline"><Phone className="h-3 w-3" />{r.phone}</a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {r.program_interest.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">{p.replace(/_/g, " ")}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v: any) => updateStatus(r.id, v)}>
                        <SelectTrigger className="w-[130px] h-8">
                          <Badge className={STATUS_COLOR[r.status]}>{r.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setSelected(r); setNotes(r.admin_notes || ""); }} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadKit(r.institution_name)} title="Download outreach kit PDF">
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-green-700 hover:bg-green-100/60" onClick={() => shareKitOnWhatsApp(r)} title="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Institution</p><p className="font-medium">{selected.institution_name}</p></div>
                <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{selected.institution_type}</p></div>
                <div><p className="text-muted-foreground">Contact</p><p className="font-medium">{selected.contact_person}</p></div>
                <div><p className="text-muted-foreground">Students</p><p className="font-medium">{selected.student_count ?? "—"}</p></div>
                <div><p className="text-muted-foreground">Email</p><a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
                <div><p className="text-muted-foreground">Phone</p><a href={`tel:${selected.phone}`} className="text-primary hover:underline">{selected.phone}</a></div>
                <div><p className="text-muted-foreground">Location</p><p className="font-medium">{[selected.city, selected.state].filter(Boolean).join(", ") || "—"}</p></div>
                <div><p className="text-muted-foreground">Preferred date</p><p className="font-medium">{selected.preferred_date || "—"}</p></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Programs of interest</p>
                <div className="flex flex-wrap gap-1">
                  {selected.program_interest.map((p) => (
                    <Badge key={p} variant="secondary">{p.replace(/_/g, " ")}</Badge>
                  ))}
                </div>
              </div>
              {selected.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <div className="bg-muted p-3 rounded-lg whitespace-pre-wrap text-sm">{selected.message}</div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Admin notes</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} placeholder="Internal notes..." />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveNotes} className="flex-1 min-w-[140px]">Save notes</Button>
                <Button variant="outline" onClick={() => downloadKit(selected.institution_name)} className="gap-2">
                  <FileDown className="h-4 w-4" /> Outreach kit PDF
                </Button>
                <Button variant="outline" onClick={() => shareKitOnWhatsApp(selected)} className="gap-2 text-green-700">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href={`mailto:${selected.email}?subject=Re: Himsols School Partnership — ${selected.institution_name}`}>
                    <Mail className="h-4 w-4" /> Reply
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
