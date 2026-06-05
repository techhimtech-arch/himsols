import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Calendar, Leaf, ArrowRight, Sparkles } from "lucide-react";
import {
  getDayBySlug,
  SUSTAINABILITY_DAYS,
  type SustainabilityDay,
} from "@/lib/seo/sustainability-days";

const SITE = "https://himsols.com";

function daysUntil(mmdd: string): number {
  const [m, d] = mmdd.split("-").map(Number);
  const now = new Date();
  let target = new Date(now.getFullYear(), m - 1, d);
  if (target.getTime() < now.setHours(0, 0, 0, 0)) {
    target = new Date(new Date().getFullYear() + 1, m - 1, d);
  }
  const diffMs = target.getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function injectSchema(day: SustainabilityDay, url: string) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: day.heroHeadline,
    description: day.metaDescription,
    url,
    datePublished: `${new Date().getFullYear()}-01-01`,
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "Himsols" },
    publisher: {
      "@type": "Organization",
      name: "Himsols",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/favicon.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: day.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Sustainability Days", item: `${SITE}/days` },
      { "@type": "ListItem", position: 3, name: day.name, item: url },
    ],
  };
  return [articleSchema, faqSchema, breadcrumbSchema];
}

const SustainabilityDayPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const day = slug ? getDayBySlug(slug) : null;

  const countdown = useMemo(() => (day ? daysUntil(day.date) : 0), [day]);
  const url = `${SITE}/days/${slug}`;
  const schemas = day ? injectSchema(day, url) : [];

  if (!day) return <Navigate to="/404" replace />;

  const heroHeadline = language === "hi" ? day.heroHeadlineHi : day.heroHeadline;
  const otherDays = SUSTAINABILITY_DAYS.filter((d) => d.slug !== day.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={day.metaTitle}
        description={day.metaDescription}
        keywords={day.keywords}
        url={url}
        type="article"
      />
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Calendar className="h-3 w-3" />
              {day.dateLabel}
              {countdown > 0 && countdown <= 60 && (
                <span className="ml-2 text-primary font-semibold">
                  · {countdown} day{countdown !== 1 ? "s" : ""} to go
                </span>
              )}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {heroHeadline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-2">{day.subhead}</p>
            <p className="text-sm text-muted-foreground/80 mb-8 italic">
              Theme: {day.theme}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/climate-impact-pack">
                  <Leaf className="h-4 w-4" />
                  Sponsor 10 Trees — ₹2,999
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/single-tree-pack">
                  Plant 1 Tree — ₹299 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            History of {day.name}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{day.history}</p>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Why {day.name} Matters
          </h2>
          <p className="text-muted-foreground leading-relaxed">{day.whyItMatters}</p>
        </div>
      </section>

      {/* How to celebrate */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            How to Celebrate {day.name} {new Date().getFullYear()}
          </h2>
          <ul className="space-y-3">
            {day.howToCelebrate.map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Himachal angle */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Why Plant in Himachal Pradesh
          </h2>
          <p className="text-muted-foreground leading-relaxed">{day.himachalAngle}</p>
        </div>
      </section>

      {/* CTA card */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">
                Make {day.name} count — plant a verified tree today
              </h3>
              <p className="text-muted-foreground mb-6">
                Geo-tagged proof · 3-year survival tracking · Real Himachali farmer income
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg">
                  <Link to="/climate-impact-pack">Climate Impact Pack — ₹2,999</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/corporate">Corporate CSR Plantation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            {day.name} — Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {day.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related days */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Other Sustainability Days
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherDays.map((d) => (
              <Link key={d.slug} to={`/days/${d.slug}`} className="group">
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {d.dateLabel}
                    </Badge>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {d.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SustainabilityDayPage;
