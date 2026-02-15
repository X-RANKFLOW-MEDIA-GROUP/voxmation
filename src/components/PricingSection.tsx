import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import Reveal from "@/components/Reveal";

const plans = [
  {
    name: "AUTOMATION SYSTEMS",
    tier: "Starter",
    tagline: "For Speed-to-Lead",
    setup: "$2,000",
    retainer: "$650/mo",
    features: ["1 Channel Integration", "CRM Sync", "Instant Lead Capture", "Basic Analytics Dashboard"],
    highlighted: false,
  },
  {
    name: "VOICE AI",
    tier: "Growth",
    tagline: "For High-Volume Operations",
    setup: "$4,500",
    retainer: "$1,400/mo",
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
    setup: "Custom",
    retainer: "Custom",
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
    <section id="pricing" className="py-28 md:py-36">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.25em] uppercase text-primary font-mono block mb-3 text-center">
            Infrastructure Offers
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-silver-bright mb-4 text-center tracking-tight">
            Deploy Your Revenue System
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver text-center mb-16 max-w-lg mx-auto">
            No contracts. No fluff. Just autonomous systems that pay for themselves.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={0.1 * i}>
              <div className={`rounded-2xl p-px h-full ${
                plan.highlighted
                  ? "bg-gradient-to-b from-primary/50 to-primary/10 neon-glow"
                  : "bg-border"
              }`}>
                <div className="surface-card rounded-2xl p-8 h-full flex flex-col bg-card relative overflow-hidden">
                  {/* Top accent line */}
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}

                  {plan.highlighted && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="h-3 w-3 text-primary fill-primary" />
                      <span className="text-[10px] font-mono tracking-[0.2em] text-primary uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-base font-mono font-bold text-foreground tracking-wider mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-silver mb-6">{plan.tagline}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-mono font-bold text-foreground">{plan.setup}</span>
                      <span className="text-xs text-silver font-mono">setup</span>
                    </div>
                    <p className="text-sm text-silver">
                      + <span className="text-silver-bright">{plan.retainer}</span> retainer
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-silver">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlighted ? "neon" : "neon-outline"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                      {plan.setup === "Custom" ? "Book Audit" : "Deploy Now"}
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
