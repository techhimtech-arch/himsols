import { useParams, Link, Navigate } from "react-router-dom";
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
import { Gift, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { getUseCaseBySlug, USE_CASES } from "@/lib/seo/use-cases";

const SITE = "https://himsols.online";

const PlantTreesForUseCase = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getUseCaseBySlug(slug) : null;
  if (!data) return <Navigate to="/404" replace />;

  const url = `${SITE}/plant-trees-for/${data.slug}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: data.title,
      description: data.metaDescription,
      provider: { "@type": "Organization", name: "Himsols", url: SITE },
      areaServed: { "@type": "Country", name: "India" },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Tree Plantation", item: `${SITE}/tree-plantation` },
        { "@type": "ListItem", position: 3, name: data.title, item: url },
      ],
    },
  ];

  const related = USE_CASES.filter((u) => u.slug !== data.slug);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={data.metaTitle} description={data.metaDescription} url={url} keywords={data.keywords} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Navbar />

      <section className="pt-28 pb-16 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1"><Gift className="h-3 w-3" /> {data.title}</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{data.heroHeadline}</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">{data.subhead}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to={data.primaryCtaPath}><Sparkles className="h-4 w-4" /> {data.primaryCtaLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/gift-cards">Send a Gift Card <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Why This Works</h2>
          <p className="text-muted-foreground leading-relaxed">{data.why}</p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.howItWorks.map((s, i) => (
              <Card key={i}><CardContent className="p-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">{i + 1}</div>
                <h3 className="font-semibold mb-2">{s.step}</h3>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Popular Options</h2>
          <ul className="space-y-3">
            {data.giftIdeas.map((g, i) => (
              <li key={i} className="flex gap-3 items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <span className="text-muted-foreground">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Ready to make it real?</h3>
              <p className="text-muted-foreground mb-6">Geo-tagged. Verified. Tracked for 3 years.</p>
              <Button asChild size="lg"><Link to={data.primaryCtaPath}>{data.primaryCtaLabel}</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            {data.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">More Ways to Plant Trees</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((u) => (
              <Link key={u.slug} to={`/plant-trees-for/${u.slug}`} className="group">
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-4">
                    <Gift className="h-5 w-5 text-primary mb-2" />
                    <h3 className="font-semibold group-hover:text-primary">{u.title}</h3>
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

export default PlantTreesForUseCase;
