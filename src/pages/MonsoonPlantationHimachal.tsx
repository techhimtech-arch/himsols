import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CloudRain,
  Sprout,
  ShieldCheck,
  Mountain,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
} from "lucide-react";
import { HP_CITIES } from "@/lib/seo/himachal-cities";

const SITE = "https://himsols-web-companion.lovable.app";
const YEAR = new Date().getFullYear();

const REASONS = [
  {
    icon: CloudRain,
    title: "Natural Irrigation",
    desc: "Monsoon rains (July–Aug) keep soil moist for 60+ days, eliminating manual watering — saplings establish roots before winter.",
  },
  {
    icon: Sprout,
    title: "90%+ Survival Rate",
    desc: "Saplings planted in monsoon show ~90% survival vs ~60% in dry-season plantation across Himachal hill terrain (estimate based on Forest Dept data).",
  },
  {
    icon: Mountain,
    title: "Soil Stability",
    desc: "Roots developed during monsoon bind hillside soil — directly preventing landslides that plague Himachal every year.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Plantation",
    desc: "Geo-tagged photo proof, batch ID, and 6-month survival update. Every tree is traceable to a verified land partner.",
  },
];

const TIMELINE = [
  { week: "Now – June 30", title: "Book your sapling", desc: "Reserve a slot in the monsoon batch. Pay ₹299/tree or ₹2,999/10-tree pack." },
  { week: "July 1–7", title: "Van Mahotsav Drive", desc: "First mass plantation drive of the season, in partnership with local communities." },
  { week: "July – August", title: "Active Plantation", desc: "Saplings planted across Himachal districts as rainfall peaks. You receive geo-tagged photo." },
  { week: "Feb 2027", title: "6-month Survival Report", desc: "Independent verification — sapling photo, health status, and growth update." },
];

const FAQS = [
  {
    q: "Why is monsoon the best time for plantation in Himachal?",
    a: "Monsoon brings consistent rainfall from late June to early September, which saturates the soil and creates ideal conditions for sapling roots to establish. In Himachal's hilly terrain, this is the only season when survival rates routinely cross 85–90% without irrigation infrastructure.",
  },
  {
    q: "Until when can I book a tree for monsoon plantation?",
    a: `We accept bookings through August 31, ${YEAR}. After that, saplings shift to a winter holding batch and are planted in the next monsoon. Earlier bookings get priority in the Van Mahotsav drive (July 1–7).`,
  },
  {
    q: "Where exactly will my tree be planted?",
    a: "Across verified land partner sites in 20+ Himachal cities including Shimla, Manali, Dharamshala, Kullu, Mandi, Chamba, and more. You can choose a city or let us assign based on species suitability.",
  },
  {
    q: "What species are planted during monsoon?",
    a: "Native Himalayan species: Deodar (Cedrus deodara), Himalayan Oak, Walnut, Chir Pine, Wild Cherry, Rhododendron, and others — selected based on altitude and ecological role at each site.",
  },
  {
    q: "How do I verify my tree was actually planted?",
    a: "Every tree gets a unique batch ID. You receive a geo-tagged photograph within 7 days of plantation, and a 6-month survival update with growth status. View live status anytime via /track-request.",
  },
  {
    q: "Can companies / schools book bulk plantations for monsoon?",
    a: "Yes. CSR teams and schools get dedicated coordinators, custom impact reports, and on-site participation options. Start at /corporate or /bulk-plantation.",
  },
];

const SCHEMAS = (url: string) => [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Monsoon Tree Plantation in Himachal Pradesh ${YEAR}`,
    description: `Plant trees in Himachal during monsoon ${YEAR} (July–Aug) for 90%+ survival. Native species, geo-tagged verification, starting at ₹299.`,
    url,
    datePublished: `${YEAR}-05-01`,
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "Himsols" },
    publisher: {
      "@type": "Organization",
      name: "Himsols",
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Monsoon Tree Plantation — Himachal Pradesh",
    provider: { "@type": "Organization", name: "Himsols" },
    areaServed: { "@type": "State", name: "Himachal Pradesh, India" },
    description:
      "Verified native tree plantation during monsoon window (July–August) across Himachal Pradesh. Geo-tagged proof and 6-month survival report.",
    offers: {
      "@type": "Offer",
      price: "299",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${SITE}/single-tree-pack`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Monsoon Plantation Himachal",
        item: url,
      },
    ],
  },
];

function daysUntilDeadline() {
  const deadline = new Date(`${YEAR}-08-31T23:59:59`);
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const MonsoonPlantationHimachal = () => {
  const url = `${SITE}/monsoon-plantation-himachal`;
  const [daysLeft, setDaysLeft] = useState(daysUntilDeadline());

  useEffect(() => {
    document
      .querySelectorAll('script[data-schema="monsoon"]')
      .forEach((el) => el.remove());
    SCHEMAS(url).forEach((s) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", "monsoon");
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
    });
    return () => {
      document
        .querySelectorAll('script[data-schema="monsoon"]')
        .forEach((el) => el.remove());
    };
  }, [url]);

  useEffect(() => {
    const id = setInterval(() => setDaysLeft(daysUntilDeadline()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const featuredCities = useMemo(() => HP_CITIES.slice(0, 8), []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`Monsoon Tree Plantation in Himachal ${YEAR} — Plant by Aug 31 | Himsols`}
        description={`Monsoon = best plantation season in Himachal. Plant native trees July–August ${YEAR} for 90%+ survival. Geo-tagged proof, starting ₹299. Book now.`}
        keywords="monsoon tree plantation himachal, van mahotsav 2026, plant trees himachal, monsoon plantation drive, himachal sapling booking, july august plantation india"
        url={url}
        type="article"
      />
      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 text-primary">
              <CloudRain className="h-3.5 w-3.5" />
              Monsoon Window {YEAR} · {daysLeft} days left
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Monsoon Tree Plantation in{" "}
              <span className="text-primary">Himachal Pradesh</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-3">
              July–August is the best window of the year. Soil is moist, rainfall is consistent, and saplings hit{" "}
              <span className="font-semibold text-foreground">90%+ survival</span> — vs ~60% in dry months (estimate).
            </p>
            <p className="text-base text-muted-foreground mb-8">
              हिमाचल में मानसून = पेड़ लगाने का सबसे अच्छा मौसम। अभी बुक करें।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link to="/single-tree-pack">
                  Plant 1 Tree — ₹299
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/climate-impact-pack">
                  10-Tree Pack — ₹2,999
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Booking closes Aug 31, {YEAR} · Geo-tagged proof · 6-month survival report
            </p>
          </div>
        </div>
      </section>

      {/* WHY MONSOON */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why monsoon = the best plantation season
            </h2>
            <p className="text-muted-foreground">
              For Himachal's hill terrain, timing decides whether a sapling survives or dies. Here's the science.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {REASONS.map((r) => (
              <Card key={r.title} className="border-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                      <r.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{r.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-16 md:py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-3">
              <Calendar className="h-3 w-3 mr-1.5" />
              Monsoon {YEAR} Timeline
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Van Mahotsav to your inbox
            </h2>
            <p className="text-muted-foreground">
              From booking to verification — exactly when each step happens.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {TIMELINE.map((t, i) => (
              <div key={t.week} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                    {i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/20 my-1" />
                  )}
                </div>
                <Card className="flex-1 mb-2">
                  <CardContent className="p-5">
                    <div className="text-xs font-medium text-primary mb-1">{t.week}</div>
                    <h3 className="font-semibold mb-1">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITY PICKER */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pick where to plant
            </h2>
            <p className="text-muted-foreground">
              Verified plantation sites across {HP_CITIES.length}+ Himachal cities.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {featuredCities.map((city) => (
              <Link
                key={city.slug}
                to={`/plant-trees-in/${city.slug}`}
                className="group rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <MapPin className="h-4 w-4 text-primary mb-2" />
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {city.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {city.district}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="ghost" asChild>
              <Link to="/plant-trees-in/shimla">
                See all cities <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 text-center">
            {[
              "Native Himalayan species only",
              "Geo-tagged photo within 7 days",
              "6-month survival report",
            ].map((t) => (
              <div key={t} className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-t">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {daysLeft} days left in the monsoon window
          </h2>
          <p className="text-muted-foreground mb-8">
            Book today and your sapling is part of the Van Mahotsav drive.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/single-tree-pack">
                Plant 1 Tree — ₹299 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/climate-impact-pack">10-Tree Pack — ₹2,999</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MonsoonPlantationHimachal;
