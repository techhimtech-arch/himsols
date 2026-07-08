import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Mail,
  Clock,
  FileText,
  MessageCircle,
  Calendar,
  Phone,
} from "lucide-react";


const CANONICAL = "https://himsols.com/csr/guide-to-csr-plantation-india/thank-you";

const CSRGuideThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const org = searchParams.get("org") || "";
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!org && !email) {
      toast({
        title: "No submission found",
        description: "Please fill the CSR proposal form to reach this page.",
        variant: "destructive",
      });
      navigate("/csr/guide-to-csr-plantation-india", { replace: true });
    }
  }, [org, email, navigate, toast]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Thank You — CSR Proposal Request Received | Himsols",
    description:
      "Your CSR tree plantation proposal request has been received. Himsols will email a written proposal within 24 hours.",
    url: CANONICAL,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Thank You — CSR Proposal Request Received | Himsols"
        description="Your CSR tree plantation proposal request has been received. Our team will email a written proposal with pricing, deliverables and a sample impact report within 24 hours."
        url={CANONICAL}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Navbar />

      <main className="pt-20">
        {/* Hero confirmation */}
        <section className="py-14 md:py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Proposal request received
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              {org ? (
                <>
                  Thanks <strong>{org}</strong>. We have your details and will email a written CSR proposal to{" "}
                  <strong>{email}</strong> within 24 hours.
                </>
              ) : (
                <>
                  Thanks. We have your details and will email a written CSR proposal to <strong>{email}</strong>{" "}
                  within 24 hours.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://cal.com/himsols-csr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Calendar className="h-4 w-4" /> Book a 15-min intro call <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="/Himsols-CSR-Pitch-Deck.pdf" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 border-2 w-full sm:w-auto">
                  <Download className="h-4 w-4" /> Download 1-page pitch deck
                </Button>
              </a>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No sales calls unless you ask. Prefer email? Reply directly to the proposal we send.
            </p>
          </div>
        </section>

        {/* What happens next */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What happens next</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Mail,
                  title: "Proposal email",
                  desc: "Written proposal with per-tree pricing, deliverables and timeline in 24 hours.",
                },
                {
                  icon: FileText,
                  title: "Sample impact report",
                  desc: "See a real report template with geo-tagged photos, survival data and CO₂ estimates.",
                },
                {
                  icon: Calendar,
                  title: "Optional call",
                  desc: "Book a 15-min call only if you want to discuss scope, budget or reporting.",
                },
                {
                  icon: Clock,
                  title: "Planting window",
                  desc: "Finalise before the monsoon window for the strongest survival rates.",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / urgency */}
        <section className="py-12 px-4 bg-primary/5 border-y border-border">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-3">Need this faster?</h2>
            <p className="text-muted-foreground mb-6">
              For urgent CSR reporting deadlines or budget approvals, message us on WhatsApp and we will
              prioritise your proposal.
            </p>
            <a
              href="https://wa.me/918219522575?text=Hi%20Himsols%20%E2%80%94%20I%20just%20submitted%20a%20CSR%20proposal%20request%20and%20have%20an%20urgent%20deadline."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2 border-2">
                <MessageCircle className="h-4 w-4" /> Message on WhatsApp
              </Button>
            </a>
          </div>
        </section>

        {/* Back to guide */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-3">Keep reading</h2>
            <p className="text-muted-foreground mb-6">
              Share the guide with your CSR or sustainability team to align on vendor selection and
              documentation.
            </p>
            <a href="/csr/guide-to-csr-plantation-india">
              <Button variant="outline" className="gap-2 border-2">
                <ArrowRight className="h-4 w-4 rotate-180" /> Back to the CSR guide
              </Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CSRGuideThankYou;
