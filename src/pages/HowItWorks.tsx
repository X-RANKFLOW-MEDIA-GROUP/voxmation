import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import HowItWorks from "@/components/HowItWorksReusable";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, PhoneIncoming, MessageSquareText, CalendarCheck } from "lucide-react";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const steps = [
  {
    num: "01",
    icon: PhoneIncoming,
    title: "We Answer & Triage Every Call",
    description:
      "Voxmation's AI receptionist picks up on the first ring, 24/7. It greets the caller, captures their name and reason for calling, and instantly recovers missed calls with an SMS text-back so no lead ever goes cold.",
  },
  {
    num: "02",
    icon: MessageSquareText,
    title: "We Qualify the Lead",
    description:
      "The AI asks your qualifying questions, scores urgency (including emergency HVAC, plumbing, and electrical calls), and syncs the lead straight into your CRM — ServiceTitan, Jobber, Housecall Pro, HubSpot, or Zoho.",
  },
  {
    num: "03",
    icon: CalendarCheck,
    title: "We Route & Book the Job",
    description:
      "Qualified leads are routed to the right technician or location and booked directly onto your calendar. You get the appointment, the call summary, and the recording — automatically.",
  },
];

const HowItWorksPage = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "How It Works", item: "https://voxmation.com/how-it-works" },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How Voxmation's AI Receptionist Works: Call → Qualify → Route",
    description:
      "How Voxmation answers, qualifies, and routes inbound calls for home service businesses in three automated steps.",
    totalTime: "PT5M",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
      url: `https://voxmation.com/how-it-works#step-${i + 1}`,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Voxmation answer and route calls?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Voxmation's AI answers every inbound call in under two seconds, qualifies the lead with your custom questions, and routes or books the job based on urgency and location — all synced to your CRM in real time.",
        },
      },
      {
        "@type": "Question",
        name: "What happens when a call is missed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If a call is ever missed, Voxmation instantly sends an automated SMS text-back to recover the lead, so the customer gets a response immediately instead of calling your competitor.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to set up Voxmation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most home service businesses are live within 7–14 days. Setup includes CRM integration, AI training on your call scripts, and testing with your team.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="How It Works — AI Receptionist that Answers, Qualifies & Routes Calls"
        description="See how Voxmation's AI receptionist works: it answers every call, recovers missed calls by SMS, qualifies and scores leads, then routes and books the job 24/7. Live in 7–14 days."
        path="/how-it-works"
        keywords="how AI receptionist works, AI call answering, lead qualification, call routing, missed call text back, AI voice agent process"
        jsonLd={[breadcrumbSchema, howToSchema, faqSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                How It Works
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                Call. Qualify. Route. Booked.
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                Watch how Voxmation's AI receptionist answers, qualifies, and routes a lead in real time — turning
                missed calls into booked jobs for HVAC, plumbing, electrical, and home service businesses.
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
        <HowItWorks
          title="From Ring to Booked in 3 Steps"
          subtitle="Every call is answered, qualified, and routed automatically — no extra staff required."
          steps={steps}
        />
      </main>

      {/* CTA */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                See it answer your calls.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a 15-minute demo and watch Voxmation answer, qualify, and route a live call for your business.
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

export default HowItWorksPage;
