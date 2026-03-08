import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Droplets, Zap, Home, Sparkles, Scale, ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const industries = [
  {
    id: "hvac",
    icon: Flame,
    label: "HVAC",
    title: "HVAC Companies",
    slug: "ai-voice-agent-hvac",
    scenario: "A homeowner's AC breaks at 9 PM. They call your number.",
    without: "Voicemail. They call the next company. You lose a $3,000+ job.",
    withVox: "Your AI answers instantly, qualifies the emergency, and books a next-morning appointment. Lead captured. Job booked.",
    metric: "+40% more booked jobs",
  },
  {
    id: "plumbing",
    icon: Droplets,
    label: "Plumbing",
    title: "Plumbing Companies",
    slug: "ai-voice-agent-for-plumbers",
    scenario: "A burst pipe at midnight. The homeowner is panicking.",
    without: "Your phone goes to voicemail. They Google the next plumber.",
    withVox: "AI answers, confirms emergency dispatch availability, collects info, and sends confirmation. You wake up to a booked job.",
    metric: "24/7 emergency booking",
  },
  {
    id: "electrical",
    icon: Zap,
    label: "Electrical",
    title: "Electricians",
    scenario: "A customer needs a panel upgrade quote. They call during your busiest day.",
    without: "You're on a job. The call goes unanswered. Lead gone.",
    withVox: "AI answers, qualifies the request, captures property details, and schedules an estimate. Zero interruption to your workflow.",
    metric: "15+ hrs/week saved",
  },
  {
    id: "roofing",
    icon: Home,
    label: "Roofing",
    title: "Roofing Companies",
    scenario: "Storm season. Leads are flooding in faster than you can answer.",
    without: "You miss 60% of calls. Leads go cold. Money left on the table.",
    withVox: "AI handles unlimited concurrent calls, qualifies damage claims, and books inspections. Every lead captured, none lost.",
    metric: "312% more appointments",
  },
  {
    id: "medspa",
    icon: Sparkles,
    label: "Med Spa",
    title: "Med Spas & Dental",
    scenario: "A patient wants to book a Botox appointment after hours.",
    without: "Closed office. They book with a competitor who answers.",
    withVox: "AI books the appointment, sends confirmation, and triggers a reminder sequence. No-shows drop by 89%.",
    metric: "89% fewer no-shows",
  },
  {
    id: "legal",
    icon: Scale,
    label: "Legal",
    title: "Law Firms",
    scenario: "A potential client calls about a personal injury case at 7 PM.",
    without: "Answering service takes a message. You call back 16 hours later. They already hired someone else.",
    withVox: "AI qualifies the case type, collects intake info, and books a consultation. First to respond wins the case.",
    metric: "< 1s response time",
  },
];

const IndustrySection = () => {
  const [active, setActive] = useState(0);
  const current = industries[active];

  return (
    <section id="industries" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Industry Solutions
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Built for Your Industry
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              See how Voxmation works for businesses like yours.
            </p>
          </Reveal>
        </div>

        {/* Industry tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {industries.map((ind, i) => (
            <button
              key={ind.id}
              onClick={() => setActive(i)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-wide transition-all duration-300 ${
                active === i ? "text-primary" : "text-silver hover:text-silver-bright"
              }`}
            >
              {active === i && (
                <motion.span
                  layoutId="industry-tab"
                  className="absolute inset-0 rounded-full bg-primary/8 border border-primary/15"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <ind.icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{ind.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto"
          >
            <div className="surface-card rounded-2xl p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 tracking-tight">
                {current.title}
              </h3>

              <div className="space-y-6 mb-10">
                <div>
                  <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-2">The Scenario</p>
                  <p className="text-silver-bright leading-relaxed">{current.scenario}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl border border-warning/15 bg-warning/3">
                    <p className="text-xs font-mono text-warning/70 tracking-wider uppercase mb-2">Without Voxmation</p>
                    <p className="text-silver text-sm leading-relaxed">{current.without}</p>
                  </div>

                  <div className="p-5 rounded-xl border border-primary/15 bg-primary/3">
                    <p className="text-xs font-mono text-primary/70 tracking-wider uppercase mb-2">With Voxmation</p>
                    <p className="text-silver-bright text-sm leading-relaxed">{current.withVox}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-2xl md:text-3xl font-mono font-bold text-warning tracking-tight">
                  {current.metric}
                </div>
                <Button variant="neon" size="lg" asChild>
                  <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Book a Demo
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default IndustrySection;
