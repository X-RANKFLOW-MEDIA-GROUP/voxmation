import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowUpRight, Check, X, Zap, Building2, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "Starting at",
    priceValue: "$297",
    period: "/mo",
    desc: "Perfect for solo operators and small teams just getting started with AI.",
    features: [
      { text: "AI Call Answering (24/7)", included: true },
      { text: "Up to 200 calls/month", included: true },
      { text: "Missed Call Text-Back", included: true },
      { text: "Basic CRM Sync", included: true },
      { text: "1 Phone Number", included: true },
      { text: "Email Support", included: true },
      { text: "Multi-Channel Follow-Up", included: false },
      { text: "Custom AI Training", included: false },
      { text: "Dedicated Account Manager", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    icon: Building2,
    price: "Starting at",
    priceValue: "$497",
    period: "/mo",
    desc: "For growing businesses that need full automation and lead nurturing.",
    features: [
      { text: "AI Call Answering (24/7)", included: true },
      { text: "Up to 500 calls/month", included: true },
      { text: "Missed Call Text-Back", included: true },
      { text: "Full CRM Integration", included: true },
      { text: "Up to 3 Phone Numbers", included: true },
      { text: "Priority Support", included: true },
      { text: "Multi-Channel Follow-Up", included: true },
      { text: "Custom AI Training", included: true },
      { text: "Dedicated Account Manager", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Rocket,
    price: "Custom",
    priceValue: "",
    period: "",
    desc: "For multi-location businesses and agencies that need unlimited scale.",
    features: [
      { text: "AI Call Answering (24/7)", included: true },
      { text: "Unlimited Calls", included: true },
      { text: "Missed Call Text-Back", included: true },
      { text: "Full CRM Integration", included: true },
      { text: "Unlimited Phone Numbers", included: true },
      { text: "24/7 Priority Support", included: true },
      { text: "Multi-Channel Follow-Up", included: true },
      { text: "Custom AI Training", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
    cta: "Talk to Sales",
    popular: false,
  },
];

const comparison = [
  { feature: "Monthly Cost", vox: "From $297/mo", human: "$2,500–$4,000/mo" },
  { feature: "Availability", vox: "24/7/365", human: "40 hrs/week" },
  { feature: "Response Time", vox: "< 1 second", human: "Varies (minutes)" },
  { feature: "Handles Concurrent Calls", vox: "Unlimited", human: "1 at a time" },
  { feature: "Sick Days / Training", vox: "None", human: "Yes" },
  { feature: "CRM Auto-Sync", vox: "Yes", human: "Manual" },
  { feature: "Lead Qualification", vox: "Instant AI scoring", human: "Inconsistent" },
  { feature: "Automated Follow-Up", vox: "Multi-channel", human: "None" },
];

const pricingFaqs = [
  { q: "Is there a setup fee?", a: "No. Setup is completely free. We handle your CRM integration, AI training, script customization, and testing at no extra cost." },
  { q: "Are there long-term contracts?", a: "No. All plans are month-to-month. Cancel anytime. We keep you because of results, not contracts." },
  { q: "What happens if I exceed my call limit?", a: "Additional calls are billed at a competitive per-call rate. We'll notify you before you hit your limit so there are no surprises." },
  { q: "Can I change plans later?", a: "Absolutely. Upgrade or downgrade at any time. Changes take effect on your next billing cycle." },
  { q: "Do you offer a free trial?", a: "Yes. Every plan comes with a 14-day free trial. No credit card required to start." },
  { q: "What's your refund policy?", a: "We offer a 30-day money-back guarantee. If you're not seeing results, we'll refund your first month — no questions asked." },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pricing — Transparent Plans for Every Business Size"
        description="AI voice agent pricing for home service businesses. No contracts, no setup fees. Plans starting at $297/mo. Compare vs. hiring a human receptionist."
        path="/pricing"
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: pricingFaqs.map(f => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">Pricing</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Simple, Transparent Pricing
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              No hidden fees. No long-term contracts. Pay less than a part-time receptionist — get 10x the results.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={0.1 * i} scale>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.4 } }}
                  className={`surface-card rounded-2xl p-8 h-full relative overflow-hidden flex flex-col ${
                    plan.popular ? "border-primary/30 ring-1 ring-primary/10" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                  {plan.popular && (
                    <span className="absolute top-4 right-4 text-[10px] font-mono tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div className="mb-6">
                    <plan.icon className="h-5 w-5 text-primary/60 mb-4" />
                    <h3 className="text-xl font-display font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-silver text-xs leading-relaxed mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
                      {plan.priceValue ? (
                        <>
                          <span className="text-xs text-silver font-mono">{plan.price}</span>
                          <span className="text-3xl font-mono font-bold text-foreground">{plan.priceValue}</span>
                          <span className="text-xs text-silver font-mono">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-mono font-bold text-foreground">{plan.price}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-3">
                        {f.included ? (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                        )}
                        <span className={`text-xs font-mono ${f.included ? "text-silver-bright" : "text-muted-foreground/40"}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button variant={plan.popular ? "neon" : "neon-outline"} size="lg" className="w-full" asChild>
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                      {plan.cta}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison vs Human */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              Voxmation vs. Human Receptionist
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 text-center border-b border-border px-6 py-5">
                <span className="text-xs font-mono text-silver tracking-wider text-left">Feature</span>
                <span className="text-xs font-mono text-primary tracking-[0.1em] uppercase font-bold">Voxmation</span>
                <span className="text-xs font-mono text-silver tracking-wider">Human Receptionist</span>
              </div>
              {comparison.map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-3 items-center text-center px-6 py-4 ${i < comparison.length - 1 ? "border-b border-border/50" : ""}`}>
                  <span className="text-xs text-silver-bright text-left font-mono">{row.feature}</span>
                  <span className="text-xs text-primary font-mono font-bold">{row.vox}</span>
                  <span className="text-xs text-silver font-mono">{row.human}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              Pricing FAQ
            </h2>
          </Reveal>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {pricingFaqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="surface-card rounded-2xl border border-border px-6 hover:border-primary/15 transition-colors duration-500 data-[state=open]:border-primary/20"
                >
                  <AccordionTrigger className="text-sm font-display font-semibold text-foreground hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-silver text-sm leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Pricing;
