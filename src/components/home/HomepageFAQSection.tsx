import { memo, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FAQS = [
  {
    q: "How does Himsols actually plant trees?",
    a: "You sponsor online (from ₹299/tree). We allocate your tree to a verified farmer in Himachal Pradesh, plant during the right season, share geo-tagged photos + GPS coordinates within 48 hours of plantation, and track survival for 3 years.",
  },
  {
    q: "Is the ₹299 single tree pack legit? Where does the money go?",
    a: "Yes. ₹299 covers the sapling, planting labour, the farmer's 3-year survival incentive (₹120 spread over multi-year payouts), monitoring, geo-tag certificate generation and platform costs. We do not sell carbon credits — every tree is one real planted tree.",
  },
  {
    q: "Does Himsols give 80G tax-deduction receipts?",
    a: "Donations made to our verified CSR/fundraiser campaigns are eligible for 80G receipts. Standalone tree purchases (₹299 / ₹2,999 packs) are commercial sponsorships, not donations, and do not carry 80G. For 80G-eligible CSR plantation, use the Corporate / CSR page.",
  },
  {
    q: "How do I know my tree is real and not fake?",
    a: "Every Himsols tree comes with: (1) GPS coordinates pinned on a map, (2) geo-tagged photo of the sapling with the farmer, (3) farmer's name and village, (4) tracking ID viewable on your dashboard, (5) 6-month and 12-month survival photo updates.",
  },
  {
    q: "Which trees does Himsols plant?",
    a: "Native and climate-suited species only — Deodar, Himalayan Oak, Walnut, Blue Pine, Chir Pine, Rhododendron, Mango, Neem, Toon, Mulberry, Sea Buckthorn (Spiti) and more. Species choice depends on altitude, soil and farmer livelihood needs.",
  },
  {
    q: "How much CO₂ does one tree offset?",
    a: "A mature, healthy native tree absorbs approximately 22 kg of CO₂ per year over its lifetime (industry estimate — actual values depend on species, age and conditions). Himsols always labels CO₂ numbers as estimates and never overstates impact.",
  },
  {
    q: "Can a company use Himsols for CSR / ESG reporting?",
    a: "Yes — we work with companies for CSR plantation, carbon offset documentation and ESG reporting (Schedule VII compliance). Bulk packages start at 500 trees. See the Corporate / CSR page or download the proposal PDF on our Bulk Plantation page.",
  },
  {
    q: "Can I gift a tree to someone?",
    a: "Yes — buy a Green Gift Card with a personalised message, send it via WhatsApp or email. The recipient redeems it for their own tree plantation with their name on the certificate.",
  },
];

export const HomepageFAQSection = memo(() => {
  // Build aggregateRating + FAQPage + Review schema from live testimonials
  const { data: testimonials } = useQuery({
    queryKey: ["homepage-aggregate-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("name, quote, rating, location, role")
        .eq("is_active", true);
      return data || [];
    },
  });

  useEffect(() => {
    const ratings = (testimonials || []).map((t) => t.rating || 5);
    const count = ratings.length;
    const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;

    const schemas: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ];

    if (count >= 1) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://himsols.com/#organization",
        name: "Himsols",
        url: "https://himsols.com",
        logo: "https://himsols.com/favicon.png",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avg.toFixed(1),
          reviewCount: count,
          bestRating: "5",
          worstRating: "1",
        },
        review: (testimonials || []).slice(0, 5).map((t) => ({
          "@type": "Review",
          reviewRating: { "@type": "Rating", ratingValue: t.rating || 5, bestRating: "5" },
          author: { "@type": "Person", name: t.name },
          reviewBody: t.quote,
        })),
      });
    }

    document.querySelectorAll('script[data-schema="himsols-home"]').forEach((el) => el.remove());
    schemas.forEach((s) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", "himsols-home");
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-schema="himsols-home"]').forEach((el) => el.remove());
    };
  }, [testimonials]);

  return (
    <section className="py-16 md:py-24 px-4" id="faq">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Common Questions About Himsols
          </h2>
          <p className="text-muted-foreground">
            Real answers about how we plant, verify and track every tree.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
});

HomepageFAQSection.displayName = "HomepageFAQSection";
