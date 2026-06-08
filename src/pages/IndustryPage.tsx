import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowUpRight, Check, Droplets, Zap, Sparkles, Scale, Flame, Wrench, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface IndustryData {
  slug: string;
  name: string;
  icon: LucideIcon;
  headline: string;
  subheadline: string;
  keyword: string;
  metaDesc: string;
  heroScenario: string;
  benefits: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  testimonial: { quote: string; name: string; role: string; company: string };
  stats: { label: string; value: string }[];
}

const industries: Record<string, IndustryData> = {
  "ai-voice-agent-for-plumbers": {
    slug: "ai-voice-agent-for-plumbers",
    name: "Plumbing",
    icon: Droplets,
    headline: "Never Lose a Plumbing Call Again — Even at 2 AM",
    subheadline: "Your AI agent answers every emergency call, qualifies the job, and books the appointment while you sleep.",
    keyword: "AI answering service for plumbers",
    metaDesc: "AI voice agent for plumbing companies. Answer every call 24/7, book emergency jobs instantly, and never lose revenue to voicemail again. Try free for 14 days.",
    heroScenario: "A burst pipe at midnight. The homeowner is panicking and calls your number. Without Voxmation, they hear voicemail and call the next plumber. With Voxmation, your AI answers instantly, confirms emergency availability, collects info, and books the job.",
    benefits: [
      { title: "24/7 Emergency Booking", desc: "Your AI answers plumbing emergencies around the clock — no missed revenue from after-hours calls." },
      { title: "Instant Lead Capture", desc: "Every caller's info is captured, qualified, and synced to your CRM before you even wake up." },
      { title: "Reduced No-Shows", desc: "Automated confirmation texts and reminders help reduce no-shows." },
    ],
    faqs: [
      { q: "Can the AI handle emergency plumbing calls?", a: "Yes. The AI is trained to identify emergency vs. routine calls, collect the right info (address, issue type, urgency), and book the appropriate slot." },
      { q: "Does it work with ServiceTitan?", a: "Absolutely. We integrate with ServiceTitan, Jobber, Housecall Pro, and all major field service platforms." },
      { q: "What if the caller needs to speak to a real person?", a: "Smart escalation is built in. If the AI can't handle something, it transfers the call with full context to your team." },
      { q: "How fast is setup for a plumbing company?", a: "Most plumbing businesses are live within 7-14 days. We handle everything — scripts, integrations, and testing." },
      { q: "How much does it cost compared to an answering service?", a: "Significantly less. Most plumbing companies pay under $500/month — a fraction of what traditional answering services charge, with better results." },
    ],
    testimonial: { quote: "After-hours calls that used to reach voicemail are now answered and booked automatically — turning missed calls into jobs.", name: "Illustrative example", role: "Use case", company: "" },
    stats: [{ label: "Call answering", value: "24/7" }, { label: "Response time", value: "< 2s" }, { label: "After-hours capture", value: "Every call" }],
  },
  "ai-receptionist-electricians": {
    slug: "ai-receptionist-electricians",
    name: "Electrical",
    icon: Zap,
    headline: "Your AI Receptionist Handles Calls While You're on the Job",
    subheadline: "Stop interrupting jobs to answer the phone. Your AI qualifies leads, captures details, and books estimates automatically.",
    keyword: "AI phone agent for electricians",
    metaDesc: "AI receptionist for electricians. Never miss a call while on a job. Automated lead qualification, estimate scheduling, and CRM sync. Try free.",
    heroScenario: "A customer needs a panel upgrade quote. They call during your busiest day. Without AI, the call goes unanswered and the lead is gone. With Voxmation, your AI answers, qualifies the request, captures property details, and schedules an estimate.",
    benefits: [
      { title: "Never Interrupt a Job", desc: "Your AI handles every call while you focus on the work. Zero missed leads, zero distractions." },
      { title: "Automatic Estimate Scheduling", desc: "AI captures project details and books estimate appointments directly into your calendar." },
      { title: "15+ Hours Saved Weekly", desc: "Stop wasting time on phone tag. Let AI handle the back-and-forth scheduling." },
    ],
    faqs: [
      { q: "Can the AI understand technical electrical requests?", a: "Yes. We train the AI on electrical industry terminology — panel upgrades, rewiring, outlet installs, EV charger quotes, and more." },
      { q: "What CRMs does it integrate with?", a: "ServiceTitan, Jobber, HubSpot, Zoho, GoHighLevel, and most major CRMs and scheduling tools." },
      { q: "Does it handle both residential and commercial leads?", a: "Absolutely. The AI qualifies the type of work and routes accordingly." },
      { q: "How quickly can I be set up?", a: "7-14 days. We customize scripts for your electrical business and test everything before going live." },
      { q: "Can it send follow-up texts to leads?", a: "Yes. Missed call text-back, appointment confirmations, and follow-up sequences are all automated." },
    ],
    testimonial: { quote: "The AI answers and qualifies every inbound call, capturing leads that an answering service would have only taken a message for.", name: "Illustrative example", role: "Use case", company: "" },
    stats: [{ label: "Lead capture", value: "Every call" }, { label: "Availability", value: "24/7" }, { label: "Response time", value: "< 2s" }],
  },
  "ai-booking-agent-spa-salon": {
    slug: "ai-booking-agent-spa-salon",
    name: "Spa & Salon",
    icon: Sparkles,
    headline: "Book More Appointments — Even After Hours",
    subheadline: "Your AI books appointments, sends confirmations, and helps reduce no-shows. All while your spa is closed.",
    keyword: "AI appointment booking for spas",
    metaDesc: "AI booking agent for spas and salons. 24/7 appointment scheduling, automated reminders, and fewer no-shows. Start your free trial.",
    heroScenario: "A client wants to book a facial at 10 PM. Your office is closed. Without AI, they book with a competitor. With Voxmation, your AI books the appointment instantly, sends confirmation, and triggers a reminder sequence.",
    benefits: [
      { title: "24/7 Appointment Booking", desc: "Clients book anytime — evenings, weekends, holidays. Never lose a booking to closed hours." },
      { title: "Fewer No-Shows", desc: "Automated confirmation texts and reminders help reduce missed appointments." },
      { title: "Upsell on Autopilot", desc: "AI suggests add-on services during the booking flow to increase average ticket value." },
    ],
    faqs: [
      { q: "Can the AI handle different service types and providers?", a: "Yes. We configure it with your full service menu, provider availability, and booking rules." },
      { q: "Does it integrate with my booking software?", a: "We integrate with most major spa/salon booking systems, Google Calendar, Calendly, and more." },
      { q: "Can it handle bilingual clients?", a: "Yes. Voxmation supports English and Spanish out of the box, with Portuguese available." },
      { q: "What about cancellations and rescheduling?", a: "The AI handles cancellations, rescheduling, and waitlist management automatically." },
      { q: "How does it reduce no-shows?", a: "Automated SMS confirmations 24h before, plus day-of reminders. Clients can confirm, cancel, or reschedule via text." },
    ],
    testimonial: { quote: "Automated reminders and confirmations help keep the calendar full and reduce no-shows, while after-hours booking captures clients around the clock.", name: "Illustrative example", role: "Use case", company: "" },
    stats: [{ label: "Reminders", value: "Automated" }, { label: "After-hours booking", value: "24/7" }, { label: "Confirmations", value: "Instant" }],
  },
  "ai-intake-agent-law-office": {
    slug: "ai-intake-agent-law-office",
    name: "Law Office",
    icon: Scale,
    headline: "First to Respond Wins the Case",
    subheadline: "Your AI qualifies cases, collects intake info, and books consultations — in under 1 second. 24/7.",
    keyword: "AI receptionist for law firms",
    metaDesc: "AI intake agent for law offices. Qualify cases, collect client info, and book consultations 24/7. First to respond wins. Try free for 14 days.",
    heroScenario: "A potential client calls about a personal injury case at 7 PM. Without AI, your answering service takes a message. You call back 16 hours later — they already hired someone else. With Voxmation, your AI qualifies the case, collects intake info, and books a consultation instantly.",
    benefits: [
      { title: "Instant Case Qualification", desc: "AI identifies case type, urgency, and value — so your team focuses on the best leads." },
      { title: "Complete Intake Automation", desc: "Collect client details, case facts, and conflict checks before the first meeting." },
      { title: "3x More Signed Cases", desc: "First to respond wins in legal. Sub-second response time means you get the client." },
    ],
    faqs: [
      { q: "Can the AI handle different practice areas?", a: "Yes. We train it for personal injury, family law, criminal defense, immigration, estate planning, and more." },
      { q: "Is client communication confidential?", a: "Absolutely. All data is encrypted and stored securely. We follow strict data privacy standards." },
      { q: "Does it integrate with legal CRMs?", a: "Yes — Clio, MyCase, PracticePanther, Zoho, HubSpot, and most major legal practice management tools." },
      { q: "Can it screen for conflicts of interest?", a: "Yes. The AI can run basic conflict checks against names you provide during intake." },
      { q: "What about after-hours emergency calls?", a: "The AI handles them 24/7, qualifying urgency and escalating true emergencies to your designated attorney." },
    ],
    testimonial: { quote: "Prospective-client calls are answered and qualified instantly, so the firm responds first — and in legal, first to respond often wins.", name: "Illustrative example", role: "Use case", company: "" },
    stats: [{ label: "Intake answering", value: "24/7" }, { label: "Response time", value: "< 2s" }, { label: "Lead capture", value: "Every call" }],
  },
  "ai-voice-agent-hvac": {
    slug: "ai-voice-agent-hvac",
    name: "HVAC",
    icon: Flame,
    headline: "Capture Every HVAC Call — Storm Season or Not",
    subheadline: "Your AI handles unlimited concurrent calls, qualifies emergencies, and books jobs. Never miss a $3,000+ service call again.",
    keyword: "AI answering service HVAC companies",
    metaDesc: "AI voice agent for HVAC companies. Handle unlimited calls during storm season, book emergency repairs 24/7, and capture every lead. Free trial.",
    heroScenario: "A homeowner's AC breaks at 9 PM in July. They call your number. Without AI, they get voicemail and call the next company — you lose a $3,000+ job. With Voxmation, your AI answers instantly, qualifies the emergency, and books a next-morning appointment.",
    benefits: [
      { title: "Unlimited Concurrent Calls", desc: "Storm season? No problem. Your AI handles every call simultaneously — no busy signals, ever." },
      { title: "Emergency Prioritization", desc: "AI identifies true emergencies vs. routine maintenance and routes them appropriately." },
      { title: "+40% More Booked Jobs", desc: "Capture every after-hours call that used to go to voicemail. That's real revenue recovered." },
    ],
    faqs: [
      { q: "Can it handle storm season call volume?", a: "Yes. Unlike human receptionists, AI handles unlimited concurrent calls. No busy signals, no hold times." },
      { q: "Does it know the difference between emergency and routine calls?", a: "Absolutely. We train the AI to identify AC failure, heating emergencies, gas leaks vs. tune-ups and filter changes." },
      { q: "What CRMs and dispatch tools does it work with?", a: "ServiceTitan, Jobber, Housecall Pro, GoHighLevel, and all major HVAC field service platforms." },
      { q: "Can it provide estimates or pricing?", a: "The AI can share your standard pricing ranges and book an in-home estimate for custom quotes." },
      { q: "How does it handle seasonal maintenance plan upsells?", a: "We can configure the AI to mention your maintenance plans during relevant calls and capture interested leads." },
    ],
    testimonial: { quote: "During storm-season surges, the AI answers unlimited concurrent calls so every inbound lead is captured and booked for an inspection.", name: "Illustrative example", role: "Use case", company: "" },
    stats: [{ label: "Storm-surge capacity", value: "Unlimited" }, { label: "Call capture", value: "Every call" }, { label: "Availability", value: "24/7" }],
  },
};

const IndustryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? industries[slug] : null;

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Industry Not Found</h1>
          <Link to="/" className="text-primary underline font-mono text-sm">Go Home</Link>
        </div>
      </div>
    );
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `AI Voice Agent for ${data.name}`,
    description: data.metaDesc,
    provider: { "@type": "Organization", name: "Voxmation" },
    areaServed: { "@type": "Country", name: "United States" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`AI Voice Agent for ${data.name} — 24/7 Call Answering`}
        description={data.metaDesc}
        path={`/${data.slug}`}
        jsonLd={[faqSchema, serviceSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <data.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono">{data.name}</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                {data.headline}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">{data.subheadline}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="neon" size="xl" asChild>
                  <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Start Free 14-Day Trial <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="neon-outline" size="xl" asChild>
                  <Link to="/demo" className="gap-2">
                    Hear a Live Demo <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {data.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 * i} scale>
                <div className="surface-card rounded-2xl p-8 text-center">
                  <p className="text-3xl md:text-4xl font-mono font-bold text-warning mb-2">{s.value}</p>
                  <p className="text-silver text-xs font-mono">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Scenario */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="surface-card rounded-2xl p-10 md:p-14">
                <span className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-4 block">Real Scenario</span>
                <p className="text-silver-bright text-lg leading-relaxed">{data.heroScenario}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              Why {data.name} Companies Choose Voxmation
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {data.benefits.map((b, i) => (
              <Reveal key={b.title} delay={0.1 * i} scale>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.4 } }}
                  className="surface-card rounded-2xl p-8 h-full group hover:border-primary/15 transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5">
                    <Check className="h-5 w-5 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3">{b.title}</h3>
                  <p className="text-silver text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal scale>
            <div className="max-w-2xl mx-auto surface-card rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/30 to-transparent" />
              <p className="text-lg text-foreground font-display font-light leading-relaxed mb-6">
                {data.testimonial.quote}
              </p>
              <p className="text-[10px] text-silver font-mono mt-1 uppercase tracking-wider">
                Illustrative example · {data.name}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              FAQ for {data.name} Businesses
            </h2>
          </Reveal>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {data.faqs.map((faq, i) => (
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

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 gradient-radial-section opacity-30 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-display font-bold text-silver-bright mb-4">
                  Ready to Stop Losing {data.name} Calls?
                </h2>
                <p className="text-silver mb-8 max-w-lg mx-auto">
                  Start your free 14-day trial. No contracts, no setup fees. See results in your first week.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="neon" size="xl" asChild>
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                      Start Free Trial <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="neon-outline" size="xl" asChild>
                    <Link to="/roi-calculator" className="gap-2">
                      <Calculator className="h-4 w-4" />
                      Calculate Your ROI
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default IndustryPage;
