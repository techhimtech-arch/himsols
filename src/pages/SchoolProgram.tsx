import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { GraduationCap, TreePine, Sparkles, Users, CheckCircle2, ArrowRight, Loader2, School, BookOpen, Recycle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { INDIAN_STATES } from "@/lib/constants";

const PROGRAMS = [
  { id: "plantation_drive", en: "Plantation Drive", hi: "वृक्षारोपण ड्राइव", icon: TreePine, desc_en: "On-campus tree planting with students and staff.", desc_hi: "छात्रों के साथ कैंपस में पेड़ लगाना।" },
  { id: "sustainability_workshop", en: "Sustainability Workshop", hi: "सस्टेनेबिलिटी वर्कशॉप", icon: BookOpen, desc_en: "Hands-on classes on climate, waste, water and energy.", desc_hi: "जलवायु, कचरा, पानी और ऊर्जा पर इंटरैक्टिव क्लास।" },
  { id: "eco_club", en: "Eco-Club Setup", hi: "इको-क्लब सेटअप", icon: Sparkles, desc_en: "Help schools start a student-led green club.", desc_hi: "स्कूल में स्टूडेंट-लेड ग्रीन क्लब शुरू करें।" },
  { id: "scrap_drive", en: "Campus Scrap Drive", hi: "कैंपस स्क्रैप ड्राइव", icon: Recycle, desc_en: "Doorstep pickup; convert scrap into trees planted by your school.", desc_hi: "स्कूल का कचरा उठाएँ, पेड़ों में बदलें।" },
];

const formSchema = z.object({
  institution_name: z.string().trim().min(2).max(150),
  institution_type: z.enum(["school", "college", "ngo", "other"]),
  contact_person: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  student_count: z.number().int().min(0).max(100000).optional().nullable(),
  program_interest: z.array(z.string()).min(1, "Choose at least one program"),
  preferred_date: z.string().optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

const SchoolProgram = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    institution_name: "",
    institution_type: "school" as "school" | "college" | "ngo" | "other",
    contact_person: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    student_count: "",
    program_interest: [] as string[],
    preferred_date: "",
    message: "",
  });

  // Live impact (best-effort; admins only see all; we show count of completed)
  const { data: stats } = useQuery({
    queryKey: ["school-program-impact"],
    queryFn: async () => {
      // Public can't read all rows; that's fine — show static-but-honest copy when empty
      const { count } = await supabase
        .from("school_partnerships")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");
      return { completed: count || 0 };
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleProgram = (id: string) => {
    setForm((f) => ({
      ...f,
      program_interest: f.program_interest.includes(id)
        ? f.program_interest.filter((p) => p !== id)
        : [...f.program_interest, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = formSchema.parse({
        ...form,
        student_count: form.student_count ? parseInt(form.student_count, 10) : null,
      });

      const { error } = await supabase.from("school_partnerships").insert({
        institution_name: parsed.institution_name,
        institution_type: parsed.institution_type,
        contact_person: parsed.contact_person,
        email: parsed.email,
        phone: parsed.phone,
        city: parsed.city || null,
        state: parsed.state || null,
        student_count: parsed.student_count ?? null,
        program_interest: parsed.program_interest,
        preferred_date: parsed.preferred_date || null,
        message: parsed.message || null,
      });
      if (error) throw error;

      setSubmitted(true);
      toast({
        title: isHi ? "आवेदन भेज दिया गया!" : "Application sent!",
        description: isHi
          ? "हमारी टीम 2 कार्यदिवस में संपर्क करेगी।"
          : "Our team will reach out within 2 working days.",
      });
    } catch (err: any) {
      toast({
        title: isHi ? "त्रुटि" : "Error",
        description: err?.errors?.[0]?.message || err?.message || "Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Schools & Education Program | Himsols — Plantation Drives & Sustainability Workshops"
        description="Partner with Himsols to bring tree plantation drives and sustainability workshops to your school, college, or NGO. Free consultation, hands-on workshops, and eco-club setup."
        keywords="school plantation program, sustainability workshop schools, eco-club India, kids climate education, Himachal Pradesh schools"
        url="https://himsols.online/schools"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            {isHi ? "स्कूल और शिक्षा कार्यक्रम" : "Schools & Education Program"}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {isHi ? (
              <>क्लासरूम में लाएँ <span className="text-primary">सस्टेनेबिलिटी</span></>
            ) : (
              <>Bring <span className="text-primary">sustainability</span> into the classroom</>
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {isHi
              ? "स्कूल, कॉलेज और NGOs के लिए हम वृक्षारोपण ड्राइव, बच्चों के लिए वर्कशॉप और इको-क्लब सेटअप करते हैं — बिना किसी फीस के।"
              : "We run plantation drives, kids' workshops, and help set up eco-clubs in schools, colleges and NGOs — at no cost to the institution."}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{isHi ? "मुफ्त सलाह" : "Free consultation"}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{isHi ? "स्थानीय किसान सहयोग" : "Local farmer support"}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{isHi ? "इम्पैक्ट रिपोर्ट" : "Impact reports"}</span>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {isHi ? "हम क्या ऑफर करते हैं" : "What we offer"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROGRAMS.map((p) => (
              <Card key={p.id} className="border-border/50 hover:border-primary/40 transition-all hover:-translate-y-1">
                <CardContent className="p-5 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-foreground">{isHi ? p.hi : p.en}</h3>
                  <p className="text-sm text-muted-foreground">{isHi ? p.desc_hi : p.desc_en}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {isHi ? "यह कैसे काम करता है" : "How it works"}
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: "01", t_en: "Apply", t_hi: "आवेदन करें", d_en: "Submit the form — takes 2 minutes.", d_hi: "फॉर्म भरें — 2 मिनट का काम।" },
              { n: "02", t_en: "We visit", t_hi: "हम विज़िट करते हैं", d_en: "Free campus visit & program planning.", d_hi: "मुफ्त कैंपस विज़िट और योजना।" },
              { n: "03", t_en: "Plant & teach", t_hi: "पेड़ + सिखाओ", d_en: "Plantation drive + hands-on workshop.", d_hi: "वृक्षारोपण + इंटरैक्टिव वर्कशॉप।" },
              { n: "04", t_en: "Track impact", t_hi: "इम्पैक्ट ट्रैक", d_en: "Geo-tagged photos & survival reports.", d_hi: "जियो-टैग फोटो और सर्वाइवल रिपोर्ट।" },
            ].map((s) => (
              <div key={s.n} className="bg-background/80 backdrop-blur-sm rounded-2xl p-5 border border-border/50">
                <div className="text-3xl font-bold text-muted-foreground/20 mb-2">{s.n}</div>
                <div className="font-semibold mb-1">{isHi ? s.t_hi : s.t_en}</div>
                <div className="text-sm text-muted-foreground">{isHi ? s.d_hi : s.d_en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="apply" className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardContent className="p-6 md:p-8">
              {submitted ? (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{isHi ? "धन्यवाद!" : "Thank you!"}</h3>
                  <p className="text-muted-foreground">
                    {isHi
                      ? "हमारी टीम 2 कार्यदिवस के अंदर आपसे संपर्क करेगी।"
                      : "Our team will contact you within 2 working days."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <School className="h-4 w-4" />
                    {isHi ? "अपनी संस्था की जानकारी दें" : "Tell us about your institution"}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "संस्था का नाम" : "Institution name"} *</Label>
                      <Input value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} maxLength={150} required />
                    </div>
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "प्रकार" : "Type"} *</Label>
                      <Select value={form.institution_type} onValueChange={(v: any) => setForm({ ...form, institution_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">{isHi ? "स्कूल" : "School"}</SelectItem>
                          <SelectItem value="college">{isHi ? "कॉलेज" : "College / University"}</SelectItem>
                          <SelectItem value="ngo">NGO</SelectItem>
                          <SelectItem value="other">{isHi ? "अन्य" : "Other"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "संपर्क व्यक्ति" : "Contact person"} *</Label>
                      <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} maxLength={100} required />
                    </div>
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "मोबाइल" : "Phone"} *</Label>
                      <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" maxLength={15} required />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1.5 block">{isHi ? "ईमेल" : "Email"} *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "शहर" : "City"}</Label>
                      <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={80} />
                    </div>
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "राज्य" : "State"}</Label>
                      <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                        <SelectTrigger><SelectValue placeholder={isHi ? "चुनें" : "Select"} /></SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1.5 block">{isHi ? "छात्रों की संख्या" : "Student count"}</Label>
                      <Input type="number" min="0" max="100000" value={form.student_count} onChange={(e) => setForm({ ...form, student_count: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">{isHi ? "किस प्रोग्राम में रुचि है?" : "Which programs interest you?"} *</Label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {PROGRAMS.map((p) => {
                        const checked = form.program_interest.includes(p.id);
                        return (
                          <label key={p.id} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                            <Checkbox checked={checked} onCheckedChange={() => toggleProgram(p.id)} />
                            <div>
                              <div className="text-sm font-medium">{isHi ? p.hi : p.en}</div>
                              <div className="text-xs text-muted-foreground">{isHi ? p.desc_hi : p.desc_en}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1.5 block">{isHi ? "पसंदीदा तारीख" : "Preferred date"}</Label>
                    <Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} min={new Date().toISOString().slice(0, 10)} />
                  </div>

                  <div>
                    <Label className="mb-1.5 block">{isHi ? "अतिरिक्त संदेश" : "Anything else?"}</Label>
                    <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} maxLength={1000} placeholder={isHi ? "उद्देश्य, खास निवेदन, आदि" : "Goals, special requests, etc."} />
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />}
                    {isHi ? "आवेदन भेजें" : "Submit Application"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {isHi ? "हम 2 कार्यदिवस में संपर्क करेंगे।" : "We respond within 2 working days."}
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SchoolProgram;
