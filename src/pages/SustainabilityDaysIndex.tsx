import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { SUSTAINABILITY_DAYS } from "@/lib/seo/sustainability-days";

const SITE = "https://himsols.com";

const SustainabilityDaysIndex = () => {
  // sort by upcoming
  const today = new Date();
  const sorted = [...SUSTAINABILITY_DAYS].sort((a, b) => {
    const aDate = new Date(today.getFullYear(), +a.date.split("-")[0] - 1, +a.date.split("-")[1]);
    const bDate = new Date(today.getFullYear(), +b.date.split("-")[0] - 1, +b.date.split("-")[1]);
    if (aDate < today) aDate.setFullYear(today.getFullYear() + 1);
    if (bDate < today) bDate.setFullYear(today.getFullYear() + 1);
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sustainability Days Calendar — Plant Trees Year-Round | Himsols"
        description="Complete calendar of World Environment Day, Earth Day, Van Mahotsav and every major sustainability day. Plant a verified tree in Himachal for each occasion."
        keywords="sustainability days calendar, environment days India, eco days 2026, World Environment Day, Earth Day, Van Mahotsav"
        url={`${SITE}/days`}
      />
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sustainability Days Calendar
          </h1>
          <p className="text-lg text-muted-foreground">
            Eight global eco-days, one platform to take real action. Plant a verified tree for every
            occasion — geo-tagged, tracked, and grown on Himachali farmer land.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-4">
            {sorted.map((d) => (
              <Link key={d.slug} to={`/days/${d.slug}`} className="group">
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3 gap-1">
                      <Calendar className="h-3 w-3" />
                      {d.dateLabel}
                    </Badge>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {d.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">{d.theme}</p>
                    <span className="text-sm text-primary inline-flex items-center gap-1">
                      Learn more & plant <ArrowRight className="h-3 w-3" />
                    </span>
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

export default SustainabilityDaysIndex;
