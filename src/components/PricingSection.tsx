import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "AUTOMATION SYSTEMS",
    tier: "Starter",
    tagline: "For Speed-to-Lead",
    setup: "$2,000",
    retainer: "$650/mo",
    features: ["1 Channel Integration", "CRM Sync", "Instant Lead Capture", "Basic Analytics"],
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
      "Weekly Optimization",
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
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4">
        <span className="text-xs font-mono tracking-widest uppercase text-primary mb-4 block text-center">
          Infrastructure Offers
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright mb-4 text-center">
          Deploy Your Revenue System
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
          No contracts. No fluff. Just autonomous systems that pay for themselves.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-px ${
                plan.highlighted
                  ? "bg-gradient-to-b from-primary/60 to-primary/10"
                  : "bg-border"
              }`}
            >
              <div className="glass-card rounded-xl p-8 h-full flex flex-col bg-card">
                {plan.highlighted && (
                  <span className="text-xs font-mono tracking-widest text-primary mb-2">
                    ★ MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-display font-bold text-foreground tracking-wide">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-display font-bold text-foreground">
                      {plan.setup}
                    </span>
                    <span className="text-sm text-muted-foreground">setup</span>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    + {plan.retainer} retainer
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "neon" : "neon-outline"}
                  size="lg"
                  className="w-full"
                >
                  {plan.setup === "Custom" ? "Book Audit" : "Deploy Now"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
