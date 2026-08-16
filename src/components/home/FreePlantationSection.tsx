import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Camera, Award, ArrowRight, Search, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: Sprout,
    title: "1. Send the request",
    text: "Your name, location and how many trees (up to 25 per request).",
  },
  {
    icon: Camera,
    title: "2. We plant in season",
    text: "Native saplings go into farmer land or forest patches in Himachal, with photos as proof.",
  },
  {
    icon: Search,
    title: "3. Track with your ID",
    text: "Every request gets a tracking ID — follow the status on the tracking page.",
  },
  {
    icon: Award,
    title: "4. Download certificate",
    text: "Once the trees are planted, your certificate is available on the same page.",
  },
];

export const FreePlantationSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/40">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">
            <Sprout className="h-4 w-4" />
            Plantation request flow
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How a plantation request works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Same pipeline for everyone — individuals, schools and companies. Request, plantation,
            photo proof, tracking ID, certificate.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/tree-plantation" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto group">
              <Sprout className="h-4 w-4" />
              Request plantation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link to="/track-request" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Track a request
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
          <HeartHandshake className="h-3.5 w-3.5" />
          Support is welcome but always optional — it helps cover saplings, transport and farmer care.
        </p>
      </div>
    </section>
  );
};
