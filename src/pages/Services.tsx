import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Phone,
  Workflow,
  Link2,
  MessageSquare,
  UserCheck,
  CalendarCheck,
  Star,
  Tags,
} from "lucide-react";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const BASE = "https://voxmation.com";

const services = [
  { icon: Phone, title: "AI Receptionist", desc: "An AI voice agent answers every call 24/7, qualifies leads, handles common questions, and books appointments in a natural voice." },
  { icon: MessageSquare, title: "Missed Call Recovery", desc: "Every missed or unanswered call triggers an instant SMS textback so the lead gets a response in seconds — not hours." },
  { icon: UserCheck, title: "Lead Qualification", desc: "The AI runs your qualifying questions, scores urgency, and identifies emergencies so the right leads get prioritized." },
  { icon: Workflow, title: "Call Routing", desc: "Qualified leads are routed to the right technician, location, or team member based on your rules." },
  { icon: Link2, title: "CRM Automation", desc: "Leads and call details sync automatically into the CRM and scheduling tools your team already uses." },
  { icon: CalendarCheck, title: "Appointment Booking", desc: "AI-powered scheduling books directly into your calendar and sends confirmations and reminders." },
  { icon: UserCheck, title: "SMS Follow-Up", desc: "Automated multi-touch SMS follow-up keeps the conversation going until the lead books." },
  { icon: Star, title: "Review Requests", desc: "Automated review requests help you collect more customer feedback after the job is done." },
  { icon: Tags, title: "White Label", desc: "Agencies and resellers can offer a branded AI receptionist with dedicated dashboards and setup templates." },
];

export default function Services() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${BASE}/services` },
    ],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "VOXmatiON AI Voice Automation",
    serviceType: "AI Receptionist & Voice Automation",
    description:
      "AI receptionist, missed call recovery, lead qualification, call routing, CRM automation, SMS follow-up, review requests, and white-label voice automation for service businesses.",
    provider: { "@type": "Organization", "@id": `${BASE}/#organization`, name: "VOXmatiON", url: BASE },
    areaServed: { "@type": "Country", name: "United States" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="VOXmatiON Services | AI Receptionist, Missed Call Recovery & Automation"
        description="Explore VOXmatiON services: AI receptionist, missed call recovery, lead qualification, call routing, CRM automation, SMS follow-up, review requests, and white label."
        path="/services"
        jsonLd={[breadcrumbSchema, serviceSchema]}
      />
      <Navbar />

      <section className="pt-32 pb-12 md:pt-40 md:pb-16 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 max-w-3xl text-center">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">Services</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
              Everything VOXmatiON Automates
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg md:text-xl leading-relaxed">
              One platform to answer, qualify, route, recover, and follow up on every call — built for service businesses.
            </p>
          </Reveal>
        </div>
      </section>

      <main className="container mx-auto px-6">
        <section className="py-12 md:py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={0.06 * i} scale>
                <div className="surface-card rounded-2xl p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/25 flex items-center justify-center mb-6">
                    <s.icon className="h-6 w-6 text-primary/85" />
                  </div>
                  <h2 className="text-lg font-display font-bold text-foreground mb-3">{s.title}</h2>
                  <p className="text-silver text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pb-12 md:pb-20">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-silver text-base leading-relaxed">
                Want to see the full flow? Read{" "}
                <Link to="/how-it-works" className="text-primary hover:underline">how it works</Link>, explore{" "}
                <Link to="/missed-call-recovery" className="text-primary hover:underline">missed call recovery</Link>, or{" "}
                <Link to="/tools/missed-call-roi-calculator" className="text-primary hover:underline">
                  calculate your missed-call revenue
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                See VOXmatiON in action.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a demo and watch the platform answer, qualify, and route a live call.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="neon" size="xl" asChild className="gap-2">
                  <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Book a Demo <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/pricing">See Pricing</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
