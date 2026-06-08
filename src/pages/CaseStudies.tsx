import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// Illustrative scenarios — not verified client case studies. Each describes how
// the platform handles a common situation. No invented metrics or named clients.
const caseStudies = [
  {
    company: "Plumbing company",
    result: "After-Hours Calls, Answered",
    industry: "Plumbing",
    quote: "After-hours emergency calls that used to reach voicemail are answered, triaged by urgency, and booked automatically — turning missed calls into jobs.",
    author: "Illustrative scenario",
    metrics: [
      { label: "Call answering", value: "24/7" },
      { label: "After-hours capture", value: "Every call" },
      { label: "Response time", value: "< 2s" },
    ],
  },
  {
    company: "Electrical company",
    result: "Every Lead Qualified",
    industry: "Electrical",
    quote: "Instead of an answering service taking a message, the AI answers and qualifies every inbound call, capturing leads that would otherwise be missed.",
    author: "Illustrative scenario",
    metrics: [
      { label: "Lead capture", value: "Every call" },
      { label: "Availability", value: "24/7" },
      { label: "Response time", value: "< 2s" },
    ],
  },
  {
    company: "Dental & spa practice",
    result: "Fewer No-Shows",
    industry: "Dental/Spa",
    quote: "Automated confirmations and reminder sequences help keep the calendar full and reduce no-shows, while after-hours booking captures clients around the clock.",
    author: "Illustrative scenario",
    metrics: [
      { label: "Reminders", value: "Automated" },
      { label: "After-hours booking", value: "24/7" },
      { label: "Confirmations", value: "Instant" },
    ],
  },
  {
    company: "Law firm",
    result: "First to Respond",
    industry: "Law",
    quote: "Prospective-client intake calls are answered and qualified instantly, so the firm responds before the competition — first to respond often wins in legal.",
    author: "Illustrative scenario",
    metrics: [
      { label: "Intake answering", value: "24/7" },
      { label: "Response time", value: "< 2s" },
      { label: "Lead capture", value: "Every call" },
    ],
  },
  {
    company: "HVAC company",
    result: "Storm-Surge Coverage",
    industry: "HVAC",
    quote: "During storm-season and heat-wave surges, the AI answers unlimited concurrent calls so every inbound lead is captured and booked for service.",
    author: "Illustrative scenario",
    metrics: [
      { label: "Surge capacity", value: "Unlimited" },
      { label: "Call capture", value: "Every call" },
      { label: "Availability", value: "24/7" },
    ],
  },
  {
    company: "Cleaning company",
    result: "Inquiries Captured in the Field",
    industry: "Cleaning Services",
    quote: "While crews are on the job, the AI answers inquiry calls, qualifies them, and books service — so leads aren't lost when no one can pick up.",
    author: "Illustrative scenario",
    metrics: [
      { label: "Inquiry answering", value: "24/7" },
      { label: "Lead capture", value: "Every call" },
      { label: "Booking", value: "Automated" },
    ],
  },
];

const CaseStudies = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Case Studies", item: "https://voxmation.com/case-studies" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Use Cases | How Voxmation Handles Calls Across Industries"
        description="Illustrative examples of how Voxmation handles calls for HVAC, plumbing, dental, legal, and other service businesses — answering, qualifying, and booking 24/7."
        path="/case-studies"
        jsonLd={[breadcrumbSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Results
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                How Voxmation Works Across Industries
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-4 max-w-2xl mx-auto">
                Illustrative examples of how Voxmation answers, qualifies, and books calls for service businesses.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-silver/60 text-xs md:text-sm mb-8 max-w-2xl mx-auto italic">
                These are illustrative scenarios, not verified client results. Contact us for references.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {caseStudies.map((study, i) => (
              <Reveal key={study.company} delay={0.08 * i} scale>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500 flex flex-col"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-mono text-primary/70 uppercase tracking-wide">{study.industry}</h3>
                        <h2 className="text-lg font-display font-bold text-foreground mt-1">{study.company}</h2>
                      </div>
                      <TrendingUp className="h-5 w-5 text-warning flex-shrink-0" />
                    </div>

                    <div className="mb-6">
                      <p className="text-2xl font-mono font-bold text-warning">{study.result}</p>
                    </div>

                    <blockquote className="italic text-silver text-sm leading-relaxed mb-6 border-l-2 border-primary/20 pl-4">
                      "{study.quote}"
                    </blockquote>

                    <p className="text-xs text-silver/80 font-mono mb-6">{study.author}</p>

                    {/* Metrics */}
                    <div className="space-y-3 border-t border-border pt-6">
                      {study.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between">
                          <span className="text-xs text-silver">{metric.label}</span>
                          <span className="font-mono font-bold text-warning text-sm">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Your business could be next.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Start with a free 14-day trial. See exactly how much revenue you can recover with Voxmation. No credit card required.
              </p>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  Start Free Trial <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default CaseStudies;
