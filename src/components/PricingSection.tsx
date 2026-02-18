import { Button } from "@/components/ui/button";
import { Check, Star, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";

const plans = [
  {
    name: "AUTOMATION SYSTEMS",
    tier: "Starter",
    tagline: "For Speed-to-Lead",
    features: ["1 Channel Integration", "CRM Sync", "Instant Lead Capture", "Basic Analytics Dashboard"],
    highlighted: false,
  },
  {
    name: "VOICE AI",
    tier: "Growth",
    tagline: "For High-Volume Operations",
    features: [
      "24/7 Voice Agent",
      "Calendar Booking",
      "Multi-Channel Capture",
      "R-O-C-E Framework",
      "Weekly AI Optimization",
    ],
    highlighted: true,
  },
  {
    name: "ENTERPRISE OS",
    tier: "Scale",
    tagline: "For Multi-Location Scale",
    features: [
      "Custom LLM Training",
      "Dedicated Server",
      "SLA Guarantee",
      "Multi-Location Support",
      "Priority Engineering",
    ],
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Solutions
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Deploy Your Revenue System
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              No contracts. No fluff. Just autonomous systems that pay for themselves.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={0.1 * i} scale>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="h-full"
              >
                <div className={`rounded-2xl p-px h-full ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-primary/40 via-primary/15 to-transparent accent-glow"
                    : "bg-border/60"
                }`}>
                  <div className={`rounded-2xl p-8 lg:p-9 h-full flex flex-col relative overflow-hidden ${
                    plan.highlighted ? "bg-card" : "surface-card"
                  }`}>
                    {plan.highlighted && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    )}
                    {plan.highlighted && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-b from-primary/8 to-transparent rounded-b-full" />
                    )}

                    {plan.highlighted && (
                      <div className="flex items-center gap-2 mb-4 relative">
                        <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                        <span className="text-[10px] font-mono tracking-[0.15em] text-primary uppercase">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <h3 className="text-sm font-mono font-bold text-foreground tracking-wider mb-1 relative">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-silver mb-8 relative">{plan.tagline}</p>

                    <ul className="space-y-3.5 mb-10 flex-1 relative">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-silver">
                          <div className="w-5 h-5 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.highlighted ? "neon" : "neon-outline"}
                      size="lg"
                      className="w-full relative"
                      asChild
                    >
                      <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                        Book Your Demo
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
