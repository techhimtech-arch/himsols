import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Sprout, Camera, Award, ArrowRight, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: Sprout,
    title: "Tell us where",
    text: "Share your name, location and how many trees (up to 25) you'd like planted.",
  },
  {
    icon: Camera,
    title: "We plant & photograph",
    text: "Native saplings go into farmer land or forest patches in Himachal, with photos as proof.",
  },
  {
    icon: Award,
    title: "Get your certificate",
    text: "Once planted, download your certificate from the tracking page.",
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
            <Gift className="h-4 w-4" />
            Open to all
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Plant trees with us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Request a plantation and we'll plant native saplings and send you proof. If you have
            extra saplings at home, we'll plant those for you too. Contributions are welcome but
            always optional.
          </p>

        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
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

          <Link to="/corporate" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              I'm here for CSR / bulk
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
          <HeartHandshake className="h-3.5 w-3.5" />
          Contributions are welcome but always optional — they help cover saplings, transport and
          farmer care.
        </p>
      </div>
    </section>
  );
};
