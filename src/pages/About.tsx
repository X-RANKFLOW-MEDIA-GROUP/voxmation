import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Phone, Mail } from "lucide-react";
import { teamMembers } from "@/data/teamMembers";
import {
  VOXMATION_PHONE,
  VOXMATION_PHONE_TEL,
  VOXMATION_SALES_EMAIL,
  VOXMATION_SALES_MAILTO,
  VOXMATION_SUPPORT_EMAIL,
  VOXMATION_SUPPORT_MAILTO,
  VOXMATION_DEMO_URL,
} from "@/lib/contact";

const BASE = "https://voxmation.com";

const serves = [
  "HVAC companies",
  "Plumbers",
  "Roofing companies",
  "Electricians",
  "Garage door companies",
  "Law firms (legal intake)",
  "Medical spas",
  "Real estate teams",
];

const problems = [
  "Missed calls that go straight to a competitor",
  "After-hours and overflow calls with no coverage",
  "Slow lead response that loses high-intent customers",
  "Manual CRM entry and inconsistent follow-up",
  "No-shows from a lack of reminders",
];

const profiles = [
  { label: "LinkedIn", href: "https://linkedin.com/company/voxmation" },
  { label: "Instagram", href: "https://instagram.com/voxmation" },
  { label: "Facebook", href: "https://facebook.com/voxmation" },
  { label: "X", href: "https://x.com/voxmation" },
  { label: "YouTube", href: "https://youtube.com/@voxmation" },
  { label: "TikTok", href: "https://tiktok.com/@voxmation" },
];

export default function About() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${BASE}/about` },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About VOXmatiON | AI Receptionist & Missed Call Recovery"
        description="VOXmatiON provides AI receptionist, missed call recovery, lead qualification, call routing, CRM automation, and SMS follow-up for service businesses. Learn who we serve and how to reach us."
        path="/about"
        jsonLd={[breadcrumbSchema]}
      />
      <Navbar />

      <section className="pt-32 pb-12 md:pt-40 md:pb-16 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 max-w-3xl text-center">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">About</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
              About VOXmatiON
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg md:text-xl leading-relaxed">
              VOXmatiON is an AI voice automation platform that helps service businesses answer every call, recover missed
              calls, qualify leads, and book more jobs — 24/7.
            </p>
          </Reveal>
        </div>
      </section>

      <main className="container mx-auto px-6 max-w-3xl">
        <section className="py-8 md:py-12">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-4 tracking-[-0.02em]">
              What VOXmatiON Does
            </h2>
            <p className="text-silver text-base md:text-lg leading-relaxed">
              VOXmatiON provides an AI receptionist, missed call recovery and SMS textback, lead qualification, call
              routing, CRM automation, follow-up automation, review requests, and white-label voice automation for
              service businesses. It answers calls in real time, qualifies the caller, routes the lead, and keeps your
              CRM and follow-up running automatically.
            </p>
          </Reveal>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
              Who VOXmatiON Serves
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3">
            {serves.map((s, i) => (
              <Reveal key={s} delay={0.04 * i}>
                <div className="surface-card rounded-xl p-4 text-silver text-sm">{s}</div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
              Problems VOXmatiON Solves
            </h2>
          </Reveal>
          <ul className="space-y-3">
            {problems.map((p, i) => (
              <Reveal key={p} delay={0.04 * i}>
                <li className="text-silver text-base leading-relaxed border-l-2 border-primary/30 pl-4">{p}</li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
              VOXmatiON Contact Information
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="surface-card rounded-2xl p-6 space-y-3">
              <a href={VOXMATION_PHONE_TEL} className="flex items-center gap-3 text-silver hover:text-primary transition-colors">
                <Phone className="h-5 w-5 text-primary/80" /> {VOXMATION_PHONE}
              </a>
              <a href={VOXMATION_SALES_MAILTO} className="flex items-center gap-3 text-silver hover:text-primary transition-colors">
                <Mail className="h-5 w-5 text-primary/80" /> {VOXMATION_SALES_EMAIL} (Sales)
              </a>
              <a href={VOXMATION_SUPPORT_MAILTO} className="flex items-center gap-3 text-silver hover:text-primary transition-colors">
                <Mail className="h-5 w-5 text-primary/80" /> {VOXMATION_SUPPORT_EMAIL} (Support)
              </a>
            </div>
          </Reveal>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
              Meet the Team
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <Reveal key={member.name} delay={0.04 * i}>
                <div className="group relative">
                  <div className="mb-4 rounded-xl overflow-hidden h-56 w-full bg-gradient-to-br from-primary/10 to-secondary/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg font-display font-bold text-silver-bright mb-1 tracking-[-0.02em]">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-1">{member.role}</p>
                  <p className="text-xs text-silver">{member.department}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-3 tracking-[-0.02em]">
              Official Brand Profiles
            </h2>
            <p className="text-silver text-sm leading-relaxed mb-6">
              VOXmatiON (voxmation.com) is an AI receptionist and missed-call-recovery platform for service businesses.
              It is a distinct brand and is not affiliated with Voxme inventory software, Voxmotion Agency, or VoxMachine.
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {profiles.map((p, i) => (
              <Reveal key={p.label} delay={0.04 * i}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface-card rounded-full px-5 py-2 text-sm text-silver hover:text-primary transition-colors"
                >
                  {p.label}
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Ready to recover missed calls?
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a demo and see VOXmatiON answer, qualify, and route a live call for your business.
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
