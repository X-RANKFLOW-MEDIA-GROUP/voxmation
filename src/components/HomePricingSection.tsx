import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { VOXMATION_PHONE, VOXMATION_PHONE_TEL } from "@/lib/contact";
import { Check, X, Phone } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$297",
    period: "/month",
    description: "For operators who need reliable 24/7 call answering and lead capture.",
    features: [
      { text: "Answer calls 24/7", included: true },
      { text: "Basic lead capture", included: true },
      { text: "Missed call text-back", included: true },
      { text: "Email alerts", included: true },
      { text: "Advanced CRM automation", included: false },
    ],
    cta: "Call to Discuss",
    featured: false,
  },
  {
    name: "Growth",
    price: "$497",
    period: "/month",
    description: "For growing teams that want CRM sync, lead scoring, and follow-up automation.",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Full CRM integration", included: true },
      { text: "Lead scoring and routing", included: true },
      { text: "SMS and email follow-up", included: true },
      { text: "Priority onboarding", included: true },
    ],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-location service businesses that need custom workflows and support.",
    features: [
      { text: "Everything in Growth", included: true },
      { text: "Multi-location support", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const HomePricingSection = () => {
  return (
    <section id="pricing" className="border-y border-border py-32 md:py-40 relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Pricing
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Simple, Transparent Pricing
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-2xl mx-auto leading-relaxed">
              Start with a 7-day free trial. Your seven days begin after testing and go-live. No credit card required.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={0.1 * i} scale>
              <div className={`surface-card rounded-2xl p-8 h-full flex flex-col relative overflow-hidden ${plan.featured ? "border-primary/30 ring-1 ring-primary/15" : ""}`}>
                {plan.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-silver text-sm leading-relaxed min-h-[3rem] mb-6">{plan.description}</p>
                <div className="mb-7">
                  <span className="text-4xl font-mono font-bold text-silver-bright">{plan.price}</span>
                  {plan.period && <span className="text-sm text-silver font-mono">{plan.period}</span>}
                </div>
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-silver-bright" : "text-muted-foreground/50"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant={plan.featured ? "neon" : "neon-outline"} size="lg" asChild>
                  <a href={VOXMATION_PHONE_TEL} className="gap-2">
                    <Phone className="h-4 w-4" />
                    {plan.cta}
                  </a>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25}>
          <p className="mt-10 text-center text-silver font-mono text-sm">
            Questions about call volume or integrations?{" "}
            <a href={VOXMATION_PHONE_TEL} className="font-bold text-primary hover:underline">
              Call {VOXMATION_PHONE}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default HomePricingSection;
