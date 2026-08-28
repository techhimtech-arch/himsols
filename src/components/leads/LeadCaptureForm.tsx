import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { CheckCircle2, MessageCircle, Send, TreePine } from "lucide-react";

interface LeadCaptureFormProps {
  /** Where this lead came from, e.g. "city:shimla" or "use-case:birthday" */
  source: string;
  /** Short label shown in the heading, e.g. "Shimla" */
  contextLabel?: string;
  title?: string;
  description?: string;
  defaultTrees?: number;
  className?: string;
}

export const LeadCaptureForm = ({
  source,
  contextLabel,
  title,
  description,
  defaultTrees = 100,
  className = "",
}: LeadCaptureFormProps) => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    organisation: "",
    email: "",
    phone: "",
    trees: String(defaultTrees),
    message: "",
  });

  const whatsappNumber = settings?.whatsapp_number;
  const heading =
    title ?? (contextLabel ? `Plan a plantation in ${contextLabel}` : "Plan your plantation");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const trees = parseInt(form.trees, 10);
      const { error } = await supabase.from("csr_partners").insert({
        company_name: form.organisation || form.name,
        company_type: "lead",
        contact_person: form.name,
        email: form.email,
        phone: form.phone,
        interest_area: source,
        estimated_trees: Number.isFinite(trees) ? trees : null,
        message: [contextLabel ? `Page: ${contextLabel}` : null, form.message]
          .filter(Boolean)
          .join(" — "),
        status: "inquiry",
      });
      if (error) throw error;
      setDone(true);
      toast({
        title: "Request received",
        description: "Hum 24 ghante ke andar aapko reply karenge.",
      });
    } catch (err: any) {
      toast({ title: "Could not submit", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi Himsols, I want to plan a tree plantation${contextLabel ? ` in ${contextLabel}` : ""}.`,
      )}`
    : null;

  return (
    <section id="lead-form" className={`py-14 px-4 ${className}`}>
      <div className="container mx-auto max-w-3xl">
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-6 md:p-8">
            {done ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Thanks — request received</h2>
                <p className="text-muted-foreground mb-6">
                  Hum aapko plantation window, species list aur proof process share karenge.
                </p>
                {waLink && (
                  <Button asChild variant="outline">
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-primary">
                    <TreePine className="h-3.5 w-3.5" /> Talk to us
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">{heading}</h2>
                  <p className="text-muted-foreground mt-2">
                    {description ??
                      "Batayein kitne trees aur kis area mein — hum species, monsoon window aur geo-tagged proof process share karenge."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-name">Your name *</Label>
                    <Input id="lead-name" required value={form.name} onChange={set("name")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="lead-org">Company / school (optional)</Label>
                    <Input id="lead-org" value={form.organisation} onChange={set("organisation")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="lead-email">Email *</Label>
                    <Input id="lead-email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="lead-phone">Phone / WhatsApp *</Label>
                    <Input id="lead-phone" required value={form.phone} onChange={set("phone")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="lead-trees">Approx. trees</Label>
                    <Input
                      id="lead-trees"
                      type="number"
                      min={1}
                      value={form.trees}
                      onChange={set("trees")}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="lead-message">Anything else? (optional)</Label>
                    <Textarea
                      id="lead-message"
                      rows={3}
                      value={form.message}
                      onChange={set("message")}
                      className="mt-1.5"
                      placeholder="Location, timeline, CSR requirements…"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
                    <Button type="submit" size="lg" disabled={submitting} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? "Sending…" : "Send request"}
                    </Button>
                    {waLink && (
                      <Button asChild type="button" variant="outline" size="lg">
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
