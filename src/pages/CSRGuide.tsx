import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { INDIAN_STATES } from "@/lib/constants";
import {
  TreePine, Loader2, MapPin, Camera, FileText,
  ShieldCheck, BarChart3, Users, Building2, ArrowRight, Download, AlertTriangle
} from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";

const CANONICAL = "https://himsols.online/csr/guide-to-csr-plantation-india";

const TOC = [
  { id: "what-is-csr-plantation", label: "What is CSR tree plantation?" },
  { id: "section-135", label: "Section 135 & Schedule VII compliance" },
  { id: "esg-reporting", label: "How plantation fits ESG reporting" },
  { id: "cost-benchmarks", label: "Cost per tree — real benchmarks" },
  { id: "choosing-vendor", label: "How to choose a plantation vendor" },
  { id: "red-flags", label: "Red flags to avoid" },
  { id: "documentation", label: "Documentation you should demand" },
  { id: "himachal-advantage", label: "Why Himachal Pradesh?" },
  { id: "faqs", label: "FAQs" },
  { id: "inquiry", label: "Request a CSR proposal" },
];

const FormSchema = z.object({
  org_name: z.string().trim().min(2, "Required").max(150),
  contact_person: z.string().trim().min(2, "Required").max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  tree_quantity: z.coerce.number().int().min(100, "Minimum 100 trees").max(1000000),
  state: z.string().min(1, "Required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

const CSRGuide = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    org_name: "",
    contact_person: "",
    phone: "",
    email: "",
    tree_quantity: 500 as number | string,
    state: "Himachal Pradesh",
    notes: "",
    consent: false,
  });
  const upd = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      toast({ title: "Check the form", description: first || "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bulk_plantation_inquiries").insert({
      org_name: parsed.data.org_name,
      org_type: "CSR",
      contact_person: parsed.data.contact_person,
      phone: parsed.data.phone,
      email: parsed.data.email,
      state: parsed.data.state,
      tree_quantity: parsed.data.tree_quantity,
      notes: (parsed.data.notes || "") + "\n\n[Source: /csr/guide-to-csr-plantation-india]",
      consent: parsed.data.consent,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
      return;
    }
    navigate(
      `/csr/guide-to-csr-plantation-india/thank-you?org=${encodeURIComponent(parsed.data.org_name)}&email=${encodeURIComponent(parsed.data.email)}`,
      { replace: true }
    );
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Complete Guide to CSR Tree Plantation in India (2026)",
    description:
      "How Indian companies run compliant, report-ready CSR tree plantation programs under Section 135 — cost benchmarks, vendor checklist, ESG documentation.",
    author: { "@type": "Organization", name: "Himsols" },
    publisher: { "@type": "Organization", name: "Himsols" },
    datePublished: "2026-01-15",
    dateModified: "2026-07-08",
    mainEntityOfPage: CANONICAL,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does tree plantation qualify as CSR under Section 135?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Tree plantation and environmental sustainability activities fall under Schedule VII, Item (iv) of the Companies Act, 2013 — 'ensuring environmental sustainability, ecological balance, protection of flora and fauna'. It is one of the most commonly used CSR heads in India.",
        },
      },
      {
        "@type": "Question",
        name: "What is a fair cost per tree for CSR plantation in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For end-to-end plantation with sapling, planting labour, geo-tagged photos and a 6-month survival report, ₹180–₹350 per tree is typical in 2026, depending on species, terrain and volume. Rates below ₹100 usually skip aftercare or survival tracking.",
        },
      },
      {
        "@type": "Question",
        name: "What documentation should a CSR vendor provide?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "At minimum: signed MoU, GPS coordinates of each plot, dated geo-tagged photos, species list, plantation completion report, and a 6-month survival audit with photographic evidence. For CSR audit trails, retain a tax invoice and a beneficiary declaration from the landholder or panchayat.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CSR Tree Plantation in India — The Complete 2026 Guide | Himsols"
        description="How Indian companies run compliant CSR tree plantation programs under Section 135. Cost benchmarks, vendor checklist, ESG documentation, red flags. Written for CSR & sustainability heads."
        keywords="CSR tree plantation India, Section 135 CSR, ESG plantation partner, carbon offset India, corporate tree planting vendor, CSR compliance"
        url={CANONICAL}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto max-w-4xl">
            <Badge className="mb-4">Guide · 12 min read · Updated July 2026</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
              CSR Tree Plantation in India: The Complete 2026 Guide
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              Written for CSR heads, sustainability leads and ESG teams. Covers Section 135 eligibility,
              real cost benchmarks, vendor selection, documentation, and how to make your programme
              audit-ready and report-ready — without greenwashing.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#inquiry">
                <Button size="lg" className="gap-2">
                  <Building2 className="h-4 w-4" /> Request a CSR Proposal <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="/Himsols-CSR-Pitch-Deck.pdf" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 border-2">
                  <Download className="h-4 w-4" /> Download 1-page Pitch Deck
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-4xl grid lg:grid-cols-[220px_1fr] gap-10">
            {/* TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">On this page</p>
                {TOC.map((t) => (
                  <a key={t.id} href={`#${t.id}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                    {t.label}
                  </a>
                ))}
              </div>
            </aside>

            <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-p:text-foreground/90 prose-p:leading-relaxed prose-li:text-foreground/90 prose-strong:text-foreground">
              <p className="lead text-lg text-muted-foreground">
                India is the only country in the world where CSR spending is mandated by law. Since the
                Companies (Amendment) Act, 2013 came into force, listed and mid-cap firms have collectively
                spent over ₹1.5 lakh crore on CSR — and environmental sustainability, particularly
                afforestation, is one of the top three heads. But not all plantation programmes are equal,
                and a poorly structured drive can hurt both your ESG score and your CSR audit. This guide is
                the checklist we wish every CSR head had before signing a plantation MoU.
              </p>

              <h2 id="what-is-csr-plantation">What "CSR tree plantation" actually means</h2>
              <p>
                In practice, CSR tree plantation is a structured programme where a company funds the
                planting and multi-year care of trees — usually on farmer land, panchayat commons, school
                grounds or degraded forest fringe — in exchange for verified impact documentation that can
                be reported to the board, the ministry and stakeholders. It is <strong>not</strong> the same as
                a one-off employee volunteering day where saplings go into the ground and nobody comes back.
              </p>
              <p>
                A credible CSR plantation programme has four non-negotiable components:
              </p>
              <ol>
                <li><strong>Site selection</strong> — legally-held land with a written landowner MoU, so the trees are not removed after year one.</li>
                <li><strong>Native species</strong> — matched to the agro-climatic zone, not just fast-growing exotics.</li>
                <li><strong>Aftercare</strong> — watering, weeding and replacement in year one; without this, survival collapses below 40%.</li>
                <li><strong>Verification</strong> — geo-tagged photos, GPS coordinates, and a documented survival audit at 6 and 12 months.</li>
              </ol>

              <h2 id="section-135">Section 135 & Schedule VII: is plantation eligible?</h2>
              <p>
                Yes. Under <strong>Schedule VII, Item (iv)</strong> of the Companies Act, 2013, CSR spend may be
                directed towards "ensuring environmental sustainability, ecological balance, protection of
                flora and fauna, animal welfare, agroforestry, conservation of natural resources and
                maintaining quality of soil, air and water including contribution to the Clean Ganga Fund."
                Tree plantation, agroforestry and forest restoration all sit squarely within this clause.
              </p>
              <p>
                To be a valid Section 135 activity, the programme must:
              </p>
              <ul>
                <li>Be implemented through the company, a Section 8 company, a registered public trust or society, or a registered NGO with a CSR-1 filed with the MCA (or a vendor working under one).</li>
                <li>Not be undertaken in the "normal course of business" of the company.</li>
                <li>Benefit the community, not directly the company's employees or promoters.</li>
                <li>Be reported in the annual CSR report with expenditure, outcomes and impact assessment (mandatory for programmes over ₹1 crore).</li>
              </ul>
              <p>
                A plantation vendor should be able to tell you exactly which implementing entity your funds
                flow through and produce that entity's CSR-1 acknowledgement on request. If they cannot, that
                is a compliance risk you are absorbing.
              </p>

              <h2 id="esg-reporting">How plantation fits ESG reporting (BRSR)</h2>
              <p>
                Since FY 2022–23, the top 1,000 listed Indian companies must file a <strong>Business Responsibility
                and Sustainability Report (BRSR)</strong>. Tree plantation programmes contribute directly to
                several BRSR disclosures:
              </p>
              <ul>
                <li><strong>Principle 6</strong> — environmental protection, including afforestation and biodiversity indicators.</li>
                <li><strong>Principle 8</strong> — inclusive growth, when plantation happens on smallholder farmer land with a payout to the landholder.</li>
                <li><strong>GHG disclosures</strong> — trees can be reported as a Scope 3 removal, but only with a credible estimation methodology. A common, conservative rule of thumb is 20–25 kg of CO₂ sequestered per mature tree per year — always label this as an <strong>estimate</strong>, not a certified offset, unless you are buying VCS/Gold Standard credits.</li>
              </ul>
              <p>
                Do not conflate plantation with certified carbon offsets. Certified credits require third-party
                validation (VCS, Gold Standard, Verra) that takes years and typically requires 500+ hectares.
                Most Indian CSR plantation programmes are best reported as <strong>afforestation impact</strong>,
                not as offset credits.
              </p>

              <h2 id="cost-benchmarks">Cost per tree — real 2026 benchmarks</h2>
              <p>
                The market is wide because the deliverable is wide. Here is what different price points
                actually buy in India today:
              </p>
              <div className="not-prose my-8 rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="p-3 text-left font-semibold">Price per tree</th>
                      <th className="p-3 text-left font-semibold">What you typically get</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono">₹40 – ₹80</td>
                      <td className="p-3 text-muted-foreground">Sapling drop-off only. No aftercare, no geo-tag, no survival data. High-risk for CSR audit.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">₹100 – ₹180</td>
                      <td className="p-3 text-muted-foreground">Planting + one-time photos. Aftercare is usually the landowner's problem. Survival ~30–50%.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">₹180 – ₹350</td>
                      <td className="p-3 text-muted-foreground">End-to-end: native sapling, planting, guard/tree-guard if needed, geo-tagged photos, 6-month survival report.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">₹350 – ₹800</td>
                      <td className="p-3 text-muted-foreground">Multi-year care (2–3 years), individual tree tracking, quarterly reports, farmer payout for survival.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">₹800+</td>
                      <td className="p-3 text-muted-foreground">Fruit / high-value agroforestry with farmer livelihood component, or verified carbon-grade projects.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                If a vendor quotes you ₹60 per tree for a "geo-tagged, survival-tracked" programme, ask them
                to show you a live dashboard from a past project. The unit economics do not work at that
                price with real aftercare.
              </p>

              <h2 id="choosing-vendor">How to choose a plantation vendor (checklist)</h2>
              <p>Use this as a scoring rubric during vendor evaluation:</p>
              <ul>
                <li><strong>Legal entity</strong> — registered, GST-compliant, and either implementing directly or under an NGO with a filed CSR-1.</li>
                <li><strong>Land ownership</strong> — written landowner MoU (farmer, panchayat or trust) for a minimum 3-year hold.</li>
                <li><strong>Species plan</strong> — a written list of native species matched to the site, with sapling age and size.</li>
                <li><strong>Aftercare in writing</strong> — who waters, who weeds, who replaces failed saplings, and until when.</li>
                <li><strong>Verification stack</strong> — GPS coordinates per plot, dated geo-tagged photos, and a 6-month survival audit.</li>
                <li><strong>Past project evidence</strong> — at least one prior project with client logo, plot coordinates and photos you can actually visit.</li>
                <li><strong>Reporting cadence</strong> — a quarterly or bi-annual report you can put in front of your ESG committee.</li>
              </ul>

              <h2 id="red-flags">Red flags to walk away from</h2>
              <div className="not-prose my-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <ul className="space-y-2 text-sm text-foreground/90">
                    <li>"Certified carbon credits" promised at ₹100–₹200 per tree — the certification cost alone exceeds this.</li>
                    <li>No named implementing NGO, or an NGO that cannot show a CSR-1 acknowledgement.</li>
                    <li>Photos in the pitch that reverse-image search back to stock libraries or other vendors' websites.</li>
                    <li>Refusal to share past project GPS coordinates "for privacy" — real projects can be site-visited.</li>
                    <li>Survival rate claims of "95%+" without a third-party audit document.</li>
                    <li>Invoicing that routes CSR funds through a for-profit entity without an NGO in the chain.</li>
                  </ul>
                </div>
              </div>

              <h2 id="documentation">Documentation you should demand</h2>
              <p>For a CSR audit trail that will survive a ministry inquiry or an ESG rating review, insist on:</p>
              <ol>
                <li>Signed MoU between the company and the implementing entity.</li>
                <li>Landowner declaration / panchayat resolution for the plantation site.</li>
                <li>Species plan with counts and locations.</li>
                <li>Plantation completion report with GPS coordinates and dated geo-tagged photos.</li>
                <li>Tax invoice from the implementing entity, matching the MoU.</li>
                <li>6-month and 12-month survival audit with photographic evidence.</li>
                <li>Optional but strong: a short video walkthrough of the site by the field team.</li>
              </ol>
              <p>
                Retain these for a minimum of 8 years — the CSR audit look-back window under the MCA rules.
              </p>

              <h2 id="himachal-advantage">Why Himachal Pradesh is a strong CSR plantation geography</h2>
              <p>
                Not every geography survives a tree drive. Himachal Pradesh has three structural advantages
                for CSR plantation programmes:
              </p>
              <ul>
                <li><strong>Monsoon reliability</strong> — the July–September window gives young saplings a natural establishment period without needing extensive irrigation.</li>
                <li><strong>Smallholder farmer partners</strong> — plantation happens on marginal farmer land, so every tree has a landholder with skin in the game.</li>
                <li><strong>Ecological need</strong> — landslide-prone slopes and degraded forest fringe respond well to native mixed-species plantation, and impact per tree is genuinely high.</li>
              </ul>
              <p>
                <strong>A note on our stage:</strong> Himsols is in an early pilot phase. We are actively onboarding
                our first cohort of 50 verified farmer partners across Kangra, Mandi, Hamirpur, Bilaspur, Una, Solan
                and Shimla for Monsoon 2026. This means founding CSR partners get direct founder access,
                site-visit priority, and the ability to shape the programme — not a slot inside a large anonymous
                pipeline. See our{" "}
                <Link to="/monsoon-plantation-himachal" className="text-primary underline">monsoon plantation plan</Link>{" "}
                for how the timing works.
              </p>

              <h2 id="faqs">Frequently asked questions</h2>
              <h3>Does tree plantation qualify as CSR under Section 135?</h3>
              <p>
                Yes — under Schedule VII, Item (iv). It is one of the most commonly used CSR heads in India
                and applies to afforestation, agroforestry and ecological restoration.
              </p>
              <h3>What is a fair cost per tree in 2026?</h3>
              <p>
                ₹180–₹350 per tree for end-to-end plantation with sapling, planting, geo-tagged photos and a
                6-month survival report. Below ₹100 per tree, expect aftercare or verification to be missing.
              </p>
              <h3>Can we claim carbon credits from CSR plantation?</h3>
              <p>
                Usually no — certified carbon credits require VCS/Gold Standard validation, which is
                expensive and volume-heavy. Report your programme as <em>afforestation impact</em> with a
                conservative CO₂ estimate, clearly labelled as an estimate, not as certified offset.
              </p>
              <h3>What documentation should the vendor provide?</h3>
              <p>
                MoU, GPS coordinates, geo-tagged photos, species list, plantation completion report, tax
                invoice, and 6- and 12-month survival audits.
              </p>
              <h3>How long should a CSR plantation programme run?</h3>
              <p>
                A minimum of 3 years for meaningful survival. Year 1 is planting and heavy aftercare, year 2
                is replacement and monitoring, year 3 is when survival stabilises.
              </p>

              <h2 id="inquiry">Request a CSR proposal</h2>
              <p>
                Tell us your target tree count, geography and CSR reporting deadline. We will send a written
                proposal with per-tree pricing, deliverable schedule, and a sample impact report within 24
                hours. No sales calls unless you ask for one.
              </p>
            </article>
          </div>
        </section>

        {/* Trust strip */}
        <section className="py-8 px-4 border-y border-border bg-primary/5">
          <div className="container mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, label: "Geo-tagged plots" },
              { icon: Camera, label: "Dated field photos" },
              { icon: BarChart3, label: "6-month survival audit" },
              { icon: FileText, label: "CSR-ready reports" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Inquiry form */}
        <section id="inquiry-form" className="py-14 md:py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="rounded-2xl border border-border p-6 md:p-10 bg-background shadow-sm">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary mb-3">
                  <ShieldCheck className="h-3.5 w-3.5" /> No sales calls unless you ask
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Get a written CSR proposal</h2>
                <p className="text-muted-foreground text-sm">
                  Pricing, deliverable schedule and a sample impact report — in your inbox within 24 hours.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org_name">Company name *</Label>
                    <Input id="org_name" value={form.org_name} onChange={(e) => upd("org_name", e.target.value)} maxLength={150} required />
                  </div>
                  <div>
                    <Label htmlFor="contact_person">Your name *</Label>
                    <Input id="contact_person" value={form.contact_person} onChange={(e) => upd("contact_person", e.target.value)} maxLength={100} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Work email *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} maxLength={255} required />
                  </div>
                  <div>
                    <Label htmlFor="tree_quantity">Target trees *</Label>
                    <Input id="tree_quantity" type="number" min={100} value={form.tree_quantity} onChange={(e) => upd("tree_quantity", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Preferred state *</Label>
                    <Select value={form.state} onValueChange={(v) => upd("state", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Anything specific? (CSR budget, reporting deadline, ESG framework)</Label>
                  <Textarea id="notes" rows={3} maxLength={1000} value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="consent" checked={form.consent} onCheckedChange={(v) => upd("consent", Boolean(v))} />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal leading-relaxed">
                    I agree to be contacted about this CSR proposal. Himsols will not spam or share my details.
                  </Label>
                </div>
                <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                  {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : (<><TreePine className="h-4 w-4" /> Request Proposal</>)}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="py-12 px-4 bg-primary/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-3">Explore more</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/csr-carbon-offset"><Button variant="outline" className="border-2 gap-2"><Building2 className="h-4 w-4" /> CSR & Carbon Offset</Button></Link>
              <Link to="/bulk-plantation"><Button variant="outline" className="border-2 gap-2"><Users className="h-4 w-4" /> Bulk Plantation Pricing</Button></Link>
              <Link to="/impact"><Button variant="outline" className="border-2 gap-2"><BarChart3 className="h-4 w-4" /> Live Impact Dashboard</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CSRGuide;
