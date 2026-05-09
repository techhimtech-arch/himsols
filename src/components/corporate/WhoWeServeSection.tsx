import { memo } from "react";
import { GraduationCap, Hotel, Building2, Landmark, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const segments = [
  {
    icon: GraduationCap,
    title: "Schools & Universities",
    tagline: "Build the next generation of climate leaders",
    pitch: "Hands-on environmental curriculum with verified plantation drives, geo-tagged proof for accreditation reports, and student engagement workshops.",
    bullets: [
      "Annual green campus certification",
      "Eco-club activity kits & teacher training",
      "Per-student carbon footprint tracking",
    ],
    accent: "from-emerald-500/10 to-emerald-500/5",
  },
  {
    icon: Hotel,
    title: "Hotels & Hospitality",
    tagline: "Offset your guest footprint, stand out as a green property",
    pitch: "Per-stay carbon offset packages, in-room QR for guest plantations, and a green badge to display on OTAs like Booking.com & MakeMyTrip.",
    bullets: [
      "Plant-a-tree-per-booking program",
      "Branded guest impact certificates",
      "Sustainability badge & marketing assets",
    ],
    accent: "from-amber-500/10 to-amber-500/5",
  },
  {
    icon: Building2,
    title: "Corporates & MNCs",
    tagline: "Section 135 CSR compliance, made measurable",
    pitch: "Audit-ready CSR programs with geo-tagged proof, 3-year survival tracking, employee engagement events, and quarterly impact dashboards for your ESG report.",
    bullets: [
      "CSR Schedule VII compliant documentation",
      "Employee plantation drives & team-building",
      "Custom carbon offset dashboards",
    ],
    accent: "from-blue-500/10 to-blue-500/5",
  },
  {
    icon: Landmark,
    title: "Government & PSUs",
    tagline: "Scalable village-level green infrastructure",
    pitch: "End-to-end execution for state afforestation targets, MGNREGA convergence, and Panchayat-level impact reporting with bilingual audit docs.",
    bullets: [
      "Village adoption & farmer livelihood model",
      "Bilingual reports (English + Hindi)",
      "Multi-state scalability ready",
    ],
    accent: "from-rose-500/10 to-rose-500/5",
  },
];

const scrollToForm = () => {
  document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" });
};

export const WhoWeServeSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Who We Serve
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tailored climate programs for every institution
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're a school, hotel, corporate, or government body — we shape the program to your sustainability goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {segments.map((s) => (
            <div
              key={s.title}
              className={`relative rounded-2xl bg-gradient-to-br ${s.accent} border border-border/50 p-6 md:p-8 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">{s.tagline}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.pitch}</p>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={scrollToForm} className="px-8">
            Request Tailored Proposal
          </Button>
          <a href="/Himsols-CSR-Pitch-Deck.pdf" download>
            <Button size="lg" variant="outline" className="px-8 border-2">
              Download CSR Pitch Deck (PDF)
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
});

WhoWeServeSection.displayName = "WhoWeServeSection";
