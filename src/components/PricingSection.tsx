import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";

const plans = [
  {
    name: "Starter",
    price: "$50",
    period: "/month",
    features: [
      "3 Automated Workflows",
      "Basic AI Assistant Access",
      "Email + Slack Integration",
      "Monthly Performance Reports",
      "Email Support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$90",
    period: "/month",
    badge: "Popular",
    features: [
      "10+ Automated Workflows",
      "Advanced AI Assistant Features",
      "Bi-Weekly Strategy Reviews",
      "CRM + Marketing Tool Integrations",
      "Priority Support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited Custom Workflows",
      "Dedicated AI Strategist",
      "API & Private Integrations",
      "Real-Time Performance Dashboards",
      "24/7 Premium Support + SLA",
    ],
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.2em] uppercase text-silver block mb-4 text-center">
            Pricing
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4 text-center">
            Flexible Plans for Everyone
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver mb-16 max-w-lg mx-auto text-center">
            Choose a plan that fits your goals and scale as you grow
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={0.1 * i}>
              <div
                className={`rounded-2xl p-px h-full ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-foreground/20 to-foreground/5"
                    : "bg-border"
                }`}
              >
                <div className="surface-card rounded-2xl p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-silver">{plan.name}</span>
                    {plan.badge && (
                      <span className="text-[10px] tracking-widest uppercase bg-foreground text-primary-foreground px-3 py-1 rounded-full font-medium">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="mb-8">
                    <span className="text-4xl font-display font-semibold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-silver text-sm">{plan.period}</span>
                  </div>

                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                    className="w-full mb-8"
                    asChild
                  >
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                      Get Started
                    </a>
                  </Button>

                  <ul className="space-y-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-silver">
                        <Check className="h-4 w-4 text-silver-bright shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
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
