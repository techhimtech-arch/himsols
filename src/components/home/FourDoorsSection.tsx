import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, GraduationCap, TreePine, Tractor, ArrowRight } from "lucide-react";

const doors = [
  {
    icon: Building2,
    tag: "For companies",
    title: "CSR & ESG plantation",
    text: "Report-ready plantation drives with geo-tagged proof, survival tracking and CO₂ estimates for your CSR report.",
    cta: "Get a CSR proposal",
    to: "/corporate",
    primary: true,
  },
  {
    icon: GraduationCap,
    tag: "For schools",
    title: "School plantation program",
    text: "Run a campus or village drive with your students. Certificates for participants, photos for your reports.",
    cta: "See school program",
    to: "/schools",
  },
  {
    icon: TreePine,
    tag: "For individuals",
    title: "Plant a tree",
    text: "Request a plantation in your name, or gift trees to someone. Support is welcome but always optional.",
    cta: "Request plantation",
    to: "/tree-plantation",
  },
  {
    icon: Tractor,
    tag: "For farmers",
    title: "Get trees on your land",
    text: "Register your land and we bring saplings, plantation support and survival payouts.",
    cta: "Register as a farmer",
    to: "/farmer-registration",
  },

];

export const FourDoorsSection = memo(() => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
            One team, four ways in
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
            We plant trees in Himachal — pick your door
          </h2>
          <p className="text-muted-foreground">
            Companies and schools fund large drives. Individuals and farmers request plantations.
            Every tree gets the same plantation and proof process.
          </p>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {doors.map((door, i) => (
            <motion.div
              key={door.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card
                className={`h-full flex flex-col transition-shadow hover:shadow-hover ${
                  door.primary ? "border-primary/40 bg-primary/[0.03]" : ""
                }`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <door.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-muted-foreground">
                    {door.tag}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1.5 mb-2">{door.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{door.text}</p>
                  <Link to={door.to} className="mt-5">
                    <Button
                      variant={door.primary ? "default" : "outline"}
                      className="w-full group"
                      size="sm"
                    >
                      {door.cta}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

FourDoorsSection.displayName = "FourDoorsSection";
