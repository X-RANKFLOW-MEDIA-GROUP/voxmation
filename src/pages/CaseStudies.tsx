import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const caseStudies = [
  {
    company: "Premier Plumbing Co.",
    result: "35% Revenue Increase in 60 Days",
    industry: "Plumbing",
    quote: "We were losing 40% of our after-hours calls. Now our AI answers every single one and books the job. Revenue is up 35% in 60 days.",
    author: "Marcus D., Owner",
    metrics: [
      { label: "More booked jobs", value: "+40%" },
      { label: "After-hours capture", value: "100%" },
      { label: "Response time", value: "< 1s" },
    ],
  },
  {
    company: "R&R Electrical Services",
    result: "3x More Qualified Leads",
    industry: "Electrical",
    quote: "Voxmation replaced our answering service and it's not even close. The AI qualifies leads better than our $15/hr receptionist did.",
    author: "James R., Owner",
    metrics: [
      { label: "Leads per week", value: "+300%" },
      { label: "Cost savings", value: "-70%" },
      { label: "Lead quality", value: "+150%" },
    ],
  },
  {
    company: "Bright Smile Dental & Spa",
    result: "89% Fewer No-Shows",
    industry: "Dental/Spa",
    quote: "No-shows dropped by 89% after we deployed the AI reminder system. Patients love it. Staff loves it. Revenue loves it.",
    author: "Dr. Patel, Practice Owner",
    metrics: [
      { label: "No-show reduction", value: "-89%" },
      { label: "After-hours bookings", value: "+60%" },
      { label: "Satisfaction score", value: "4.9★" },
    ],
  },
  {
    company: "Westbrook Law Group",
    result: "3x More Signed Cases",
    industry: "Law",
    quote: "We signed 3x more cases last quarter because Voxmation responds to inquiries instantly. First to respond wins in legal.",
    author: "Chris W., Managing Partner",
    metrics: [
      { label: "Cases signed", value: "+3x" },
      { label: "Response time", value: "< 1s" },
      { label: "Lead completion", value: "95%" },
    ],
  },
  {
    company: "StormShield HVAC",
    result: "312% More Inspections",
    industry: "HVAC",
    quote: "We went from missing 60% of storm-season calls to capturing every single one. Booked 312% more inspections last quarter.",
    author: "Mike T., Operations Manager",
    metrics: [
      { label: "More booked jobs", value: "+40%" },
      { label: "Storm season capture", value: "100%" },
      { label: "More inspections", value: "+312%" },
    ],
  },
  {
    company: "Elite Cleaning Solutions",
    result: "45% More Service Calls",
    industry: "Cleaning Services",
    quote: "After implementing Voxmation, we're booking 45% more service calls. The AI handles inquiry calls perfectly while we're in the field.",
    author: "Sarah L., CEO",
    metrics: [
      { label: "Service calls booked", value: "+45%" },
      { label: "Response accuracy", value: "98%" },
      { label: "Customer satisfaction", value: "4.8★" },
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
        title="Case Studies | How Voxmation Helped Businesses Grow Revenue"
        description="Real results from real businesses. See how HVAC, plumbing, dental, and other service businesses increased revenue and eliminated missed calls with Voxmation AI."
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
                Proven Results Across Industries
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                From 35% revenue increases to 89% fewer no-shows. Here's what real businesses achieved with Voxmation.
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
