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
import { MapPin, Leaf, ArrowRight, Mountain } from "lucide-react";
import { getCityBySlug, HP_CITIES } from "@/lib/seo/himachal-cities";

const SITE = "https://himsols-web-companion.lovable.app";

const PlantTreesInCity = () => {
  const { city } = useParams<{ city: string }>();
  const data = city ? getCityBySlug(city) : null;
  if (!data) return <Navigate to="/404" replace />;

  const url = `${SITE}/plant-trees-in/${data.slug}`;
  const Y = new Date().getFullYear();
  const title = `Plant Trees in ${data.name} ${Y} — Verified Plantation | Himsols`;
  const desc = `Sponsor a verified tree in ${data.name}, ${data.district}, Himachal Pradesh from ₹299. Geo-tagged proof, 3-year survival tracking, native species (${data.nativeSpecies.slice(0, 3).join(", ")}).`;

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Tree Plantation in ${data.name}`,
      description: desc,
      provider: { "@type": "Organization", name: "Himsols", url: SITE },
      areaServed: {
        "@type": "Place",
        name: `${data.name}, ${data.district}, Himachal Pradesh, India`,
      },
      url,
      offers: { "@type": "Offer", price: 299, priceCurrency: "INR" },
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
        { "@type": "ListItem", position: 2, name: "Plant Trees", item: `${SITE}/tree-plantation` },
        { "@type": "ListItem", position: 3, name: data.name, item: url },
      ],
    },
  ];

  const related = HP_CITIES.filter((c) => c.slug !== data.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={desc} url={url} keywords={`plant trees ${data.name}, tree plantation ${data.name}, ${data.nameHi} पेड़ लगाओ, CSR ${data.name}`} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Navbar />

      <section className="pt-28 pb-16 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1">
            <MapPin className="h-3 w-3" /> {data.district}, Himachal Pradesh · {data.altitudeM} m
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Plant Trees in {data.name} {Y}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Verified plantation on real farmer land in and around {data.name} — geo-tagged proof in 48 hours, survival tracked for 3 years.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/single-tree-pack">
                <Leaf className="h-4 w-4" /> Plant 1 Tree — ₹299
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/climate-impact-pack">10-Tree Pack — ₹2,999 <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">About {data.name}</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong>{data.name}</strong> ({data.nameHi}) sits in {data.district} district at roughly {data.altitudeM} metres. Known for: {data.knownFor}.
          </p>
          <p className="text-muted-foreground leading-relaxed">{data.localAngle}</p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Native Species We Plant Around {data.name}</h2>
          <div className="flex flex-wrap gap-2">
            {data.nativeSpecies.map((sp) => (
              <Badge key={sp} variant="outline" className="text-sm py-2 px-4 gap-1">
                <Mountain className="h-3 w-3" /> {sp}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Plant your first {data.name} tree today</h3>
              <p className="text-muted-foreground mb-6">Geo-tagged. Verified farmer. 3-year survival tracking. Starts at ₹299.</p>
              <Button asChild size="lg"><Link to="/single-tree-pack">Plant a Tree in {data.name}</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{data.name} Tree Plantation — FAQs</h2>
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
          <h2 className="text-2xl font-bold mb-6">Plant Trees in Other Himachal Cities</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((c) => (
              <Link key={c.slug} to={`/plant-trees-in/${c.slug}`} className="group">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium group-hover:text-primary">{c.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{c.district}</span>
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

export default PlantTreesInCity;
