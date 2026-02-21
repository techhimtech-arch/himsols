import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreePine, Recycle, BookOpen, Calendar, CheckCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: <TreePine className="h-12 w-12" />,
      titleKey: "services.treePlantation",
      descKey: "services.treePlantationDesc",
      features: [
        "services.feature.nativeSpecies",
        "services.feature.plantingGuidance",
        "services.feature.postCare",
        "services.feature.communityPrograms",
      ],
      color: "hsl(150, 45%, 35%)",
      link: "/tree-plantation",
    },
    {
      icon: <Recycle className="h-12 w-12" />,
      titleKey: "services.wasteManagement",
      descKey: "services.wasteManagementDesc",
      features: [
        "services.feature.freePickup",
        "services.feature.bestPrices",
        "services.feature.allScrapTypes",
        "services.feature.ecoRecycling",
      ],
      color: "hsl(35, 80%, 50%)",
      link: "/waste-management",
    },
    {
      icon: <BookOpen className="h-12 w-12" />,
      titleKey: "services.conservation",
      descKey: "services.conservationDesc",
      features: [
        "services.feature.envAudits",
        "services.feature.sustainableTraining",
        "services.feature.resourceTips",
        "services.feature.biodiversity",
      ],
      color: "hsl(40, 65%, 50%)",
      link: "/contact",
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      titleKey: "services.ecoEvents",
      descKey: "services.ecoEventsDesc",
      features: [
        "services.feature.monthlyDrives",
        "services.feature.cleanupCampaigns",
        "services.feature.eduWorkshops",
        "services.feature.networking",
      ],
      color: "hsl(280, 60%, 50%)",
      link: "/contact",
    },
    {
      icon: <MapPin className="h-12 w-12" />,
      titleKey: "services.villageGreening",
      descKey: "services.villageGreeningDesc",
      features: [
        "services.feature.villageCampaigns",
        "services.feature.nurseryPartners",
        "services.feature.survivalTracking",
        "services.feature.impactDashboard",
      ],
      color: "hsl(160, 50%, 40%)",
      link: "/campaigns",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">{t("services.title")}</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            {t("services.subtitle")}
          </p>
        </div>
      </section>

      {/* Services Detail Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto space-y-16">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-hover transition-all duration-300">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div
                    className="p-8 md:p-12 flex items-center justify-center"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <div style={{ color: service.color }}>{service.icon}</div>
                  </div>
                  <div className="p-8 md:p-12">
                    <h3 className="text-3xl font-bold text-foreground mb-4">{t(service.titleKey)}</h3>
                    <p className="text-muted-foreground mb-6">{t(service.descKey)}</p>
                    <div className="space-y-3 mb-6">
                      {service.features.map((featureKey, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">{t(featureKey)}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={service.link}>
                      <Button>{t("services.getStarted")}</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">{t("services.readyToMakeDifference")}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("services.contactUsToday")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg">{t("footer.contact")}</Button>
            </Link>
            <Link to="/tree-plantation">
              <Button size="lg" variant="outline">
                {t("services.startPlanting")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
