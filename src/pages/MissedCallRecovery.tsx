import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import RevenueLeakCalculator from "@/components/RevenueLeakCalculator";
import FAQWithSchema from "@/components/FAQWithSchema";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageSquareText, Clock, PhoneMissed, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const benefits = [
  {
    icon: MessageSquareText,
    title: "Instant SMS Text-Back",
    description:
      "The moment a call goes unanswered, Voxmation fires an automated missed call text-back so the lead gets a reply in seconds — not hours.",
  },
  {
    icon: Clock,
    title: "24/7 After-Hours Capture",
    description:
      "Nights, weekends, holidays, and peak storm season — every missed call is recovered and qualified around the clock.",
  },
  {
    icon: Repeat,
    title: "Automated Follow-Up",
    description:
      "Multi-touch SMS follow-up keeps the conversation going until the lead books, so no opportunity slips through the cracks.",
  },
  {
    icon: PhoneMissed,
    title: "Never Lose a Lead Again",
    description:
      "Recover the 20–30% of calls most service businesses miss and turn that lost revenue back into booked jobs.",
  },
];

const faqs = [
  {
    q: "What is missed call recovery?",
    a: "Missed call recovery is the process of automatically responding to calls your business couldn't answer. Voxmation instantly sends an SMS text-back and follows up until the lead is qualified and booked, so missed calls don't become lost revenue.",
  },
  {
    q: "How fast does the missed call text-back send?",
    a: "Voxmation sends the SMS text-back within seconds of a missed or unanswered call, while the caller still has your business top of mind.",
  },
  {
    q: "Does missed call recovery work after hours?",
    a: "Yes. Voxmation recovers missed calls 24/7, including nights, weekends, holidays, and peak-season surges when most calls are missed.",
  },
  {
    q: "How much revenue do missed calls cost a home service business?",
    a: "A typical service business misses 20–30% of inbound calls. With average job values of several hundred dollars, that can add up to thousands in lost revenue every month. Use the calculator above to estimate your own number.",
  },
];

const MissedCallRecovery = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Missed Call Recovery", item: "https://voxmation.com/missed-call-recovery" },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Missed Call Recovery & Text-Back",
    serviceType: "Missed Call Text-Back",
    description:
      "Automated missed call recovery for home service businesses. Voxmation instantly texts back missed callers, qualifies the lead, and books the job 24/7.",
    provider: {
      "@type": "Organization",
      "@id": "https://voxmation.com/#organization",
      name: "Voxmation",
      url: "https://voxmation.com",
    },
    areaServed: { "@type": "Country", name: "United States" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Missed Call Recovery — Never Lose a Lead Again"
        description="Voxmation recovers every missed call with instant SMS text-back, qualifies the lead, and books the job 24/7. Stop losing 20–30% of your calls to competitors. Calculate your lost revenue."
        path="/missed-call-recovery"
        keywords="missed call recovery, missed call text back, AI receptionist, after hours answering, lead recovery, HVAC missed calls, plumbing missed calls"
        jsonLd={[breadcrumbSchema, serviceSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Missed Call Recovery
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                Every Missed Call Is Lost Revenue
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                Service businesses miss 20–30% of inbound calls — and most of those callers dial a competitor next.
                Voxmation answers, texts back, and qualifies every missed call in real time so you never lose a lead again.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Book a Demo <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <main>
        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {benefits.map((b, i) => (
                <Reveal key={b.title} delay={0.08 * i} scale>
                  <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                    className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/25 flex items-center justify-center mb-6 relative z-10">
                      <b.icon className="h-6 w-6 text-primary/85" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-foreground mb-3 relative z-10">{b.title}</h3>
                    <p className="text-silver text-sm leading-relaxed relative z-10">{b.description}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Revenue leak calculator */}
        <section className="py-16 md:py-24 border-t border-border">
          <div className="container mx-auto px-6">
            <RevenueLeakCalculator
              title="Calculate Your Missed-Call Revenue Leak"
              subtitle="See how much revenue you're losing to missed calls — and how much Voxmation can recover."
            />
          </div>
        </section>

        {/* FAQ */}
        <FAQWithSchema
          faqs={faqs}
          title="Missed Call Recovery FAQ"
          subtitle="Everything you need to know about recovering missed calls."
        />
      </main>

      {/* CTA */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Stop sending callers to your competitors.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a demo and see Voxmation recover a missed call with an instant text-back in real time.
              </p>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Book a Demo <ArrowUpRight className="h-4 w-4" />
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

export default MissedCallRecovery;
