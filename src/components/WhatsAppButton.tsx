import { useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircle, Send, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

const enquiryTypes = [
  { id: "csr", label: "CSR plantation", message: "Hi Himsols, I would like to discuss a CSR tree plantation proposal." },
  { id: "school", label: "School program", message: "Hi Himsols, I would like to know about tree plantation with my school." },
  { id: "trees", label: "Free tree request", message: "Hi Himsols, I want to enquire about free tree plantation for farmers." },
  { id: "other", label: "Other enquiry", message: "Hi Himsols, I have a question about your work." },
] as const;

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,18}$/, "Enter a valid phone number"),
  organisation: z.string().trim().max(150),
  note: z.string().trim().max(500),
});

export const WhatsAppButton = () => {
  const { settings, isLoading } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<(typeof enquiryTypes)[number]>(enquiryTypes[0]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organisation: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const number = settings?.whatsapp_number?.replace(/\D/g, "");
  if (isLoading || settings?.whatsapp_enabled !== "true" || !number || number.length < 10 || number.length > 15) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = enquirySchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { name, email, phone, organisation, note } = parsed.data;
    const page = window.location.pathname.slice(0, 180);
    const message = [choice.message, `My name is ${name}.`, organisation && `Organisation: ${organisation}.`, note].filter(Boolean).join(" ");

    try {
      const result = choice.id === "csr"
        ? await supabase.from("csr_partners").insert({
            company_name: organisation || name,
            company_type: "lead",
            contact_person: name,
            email,
            phone,
            interest_area: "whatsapp:csr",
            message: `WhatsApp enquiry from ${page}. ${note}`.trim(),
            status: "inquiry",
          })
        : await supabase.from("contact_messages").insert({
            name,
            email,
            phone,
            subject: `WhatsApp enquiry — ${choice.label}`,
            message: `Page: ${page}${organisation ? `; Organisation: ${organisation}` : ""}${note ? `; ${note}` : ""}`,
          });
      if (result.error) throw result.error;
      setSavedMessage(message);
    } catch {
      setError("Enquiry save nahi hui. Please dobara try karein.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div role="dialog" aria-label="WhatsApp enquiry" className="w-[calc(100vw-2rem)] max-w-sm max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-hover p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">WhatsApp enquiry</h2>
            <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close enquiry"><X /></Button>
          </div>
          {savedMessage ? (
            <div className="space-y-4" role="status">
              <CheckCircle2 className="text-primary h-8 w-8" />
              <p className="font-semibold">Enquiry mil gayi.</p>
              <p className="text-sm text-muted-foreground">Ab WhatsApp kholkar prepared message send karein. Team aapko wahin reply karegi.</p>
              <Button asChild className="w-full">
                <a href={`https://wa.me/${number}?text=${encodeURIComponent(savedMessage)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Open WhatsApp
                </a>
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setSavedMessage(""); setForm({ name: "", email: "", phone: "", organisation: "", note: "" }); }}>New enquiry</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-sm text-muted-foreground">Kis baare mein baat karni hai?</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choose enquiry type">
                {enquiryTypes.map((item) => (
                  <Button key={item.id} type="button" size="sm" variant={choice.id === item.id ? "default" : "outline"} aria-pressed={choice.id === item.id} className="h-auto min-h-10 whitespace-normal text-center px-2" onClick={() => setChoice(item)}>{item.label}</Button>
                ))}
              </div>
              <div><Label htmlFor="wa-name">Name *</Label><Input id="wa-name" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label htmlFor="wa-phone">Phone / WhatsApp *</Label><Input id="wa-phone" type="tel" required maxLength={18} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label htmlFor="wa-email">Email *</Label><Input id="wa-email" type="email" required maxLength={255} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              {choice.id === "csr" && <div><Label htmlFor="wa-org">Organisation (optional)</Label><Input id="wa-org" maxLength={150} value={form.organisation} onChange={e => setForm({ ...form, organisation: e.target.value })} /></div>}
              <div><Label htmlFor="wa-note">Anything else? (optional)</Label><Textarea id="wa-note" rows={2} maxLength={500} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full"><Send /> {submitting ? "Saving…" : "Save enquiry & continue"}</Button>
            </form>
          )}
        </div>
      )}
      <Button type="button" size="icon" className="h-12 w-12 rounded-full shadow-lg md:h-14 md:w-14" onClick={() => setOpen(v => !v)} aria-label={open ? "Close WhatsApp enquiry" : "Open WhatsApp enquiry"} aria-expanded={open} title="WhatsApp enquiry">
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};