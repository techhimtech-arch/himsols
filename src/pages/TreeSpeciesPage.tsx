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
import { Leaf, TreePine, ArrowRight } from "lucide-react";
import { getSpeciesBySlug, TREE_SPECIES } from "@/lib/seo/tree-species";

const SITE = "https://himsols-web-companion.lovable.app";

const TreeSpeciesPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getSpeciesBySlug(slug) : null;
  if (!data) return <Navigate to="/404" replace />;

  const url = `${SITE}/trees/${data.slug}`;
  const Y = new Date().getFullYear();
  const title = `Plant ${data.name} Tree (${data.scientific}) in India ${Y} | Himsols`;
  const desc = `Sponsor a verified ${data.name} (${data.nameHi}) plantation in Himachal from ₹299. ${data.bestFor}. Geo-tagged proof, 3-year survival tracking.`;

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${data.name} Tree — Complete Guide and Plantation in India`,
      description: desc,
      url,
      author: { "@type": "Organization", name: "Himsols" },
      publisher: {
        "@type": "Organization",
        name: "Himsols",
        logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
      },
      datePublished: `${Y}-01-01`,
      dateModified: new Date().toISOString().split("T")[0],
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
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
        { "@type": "ListItem", position: 2, name: "Trees", item: `${SITE}/shop` },
        { "@type": "ListItem", position: 3, name: data.name, item: url },
      ],
    },
  ];

  const related = TREE_SPECIES.filter((s) => s.slug !== data.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={desc} url={url} keywords={`${data.name} tree, ${data.scientific}, plant ${data.name}, ${data.nameHi}, ${data.name} sapling India`} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Navbar />

      <section className="pt-28 pb-16 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 capitalize">{data.category}</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
            {data.name} <span className="text-muted-foreground">({data.nameHi})</span>
          </h1>
          <p className="text-sm italic text-muted-foreground mb-6">{data.scientific}</p>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">{data.overview}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/single-tree-pack"><Leaf className="h-4 w-4" /> Plant {data.name} — ₹299</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/climate-impact-pack">10-Tree Pack <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Altitude", value: data.altitudeRange },
              { label: "Lifespan", value: `${data.growthYears}+ years` },
              { label: "CO₂ / year", value: `~${data.co2PerYearKg} kg (est.)` },
              { label: "Best for", value: data.bestFor },
            ].map((s) => (
              <Card key={s.label}><CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                <p className="font-semibold">{s.value}</p>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Plant {data.name}</h2>
          <p className="text-muted-foreground leading-relaxed">{data.whyPlant}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ecological Role</h2>
          <p className="text-muted-foreground leading-relaxed">{data.ecologicalRole}</p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{data.name} in Himachal Pradesh</h2>
          <p className="text-muted-foreground leading-relaxed">{data.himachalContext}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Sponsor a {data.name} tree today</h3>
              <p className="text-muted-foreground mb-6">Verified Himachali farmer · Geo-tagged · 3-year survival tracking</p>
              <Button asChild size="lg"><Link to="/single-tree-pack">Plant a {data.name} Tree — ₹299</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{data.name} — FAQs</h2>
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
          <h2 className="text-2xl font-bold mb-6">Other Native Species We Plant</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((s) => (
              <Link key={s.slug} to={`/trees/${s.slug}`} className="group">
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-4">
                    <TreePine className="h-5 w-5 text-primary mb-2" />
                    <h3 className="font-semibold group-hover:text-primary">{s.name}</h3>
                    <p className="text-xs text-muted-foreground italic">{s.scientific}</p>
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

export default TreeSpeciesPage;
