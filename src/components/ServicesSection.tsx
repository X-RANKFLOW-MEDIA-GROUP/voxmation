import { useState } from "react";
import Reveal from "@/components/Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { Workflow, Bot, Users, FlaskConical, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "workflows",
    icon: Workflow,
    label: "Workflows",
    title: "Automated Revenue Workflows",
    desc: "End-to-end automation that captures leads, qualifies them, and routes to the right team member — without a single manual step.",
    bullets: ["Lead capture from all channels", "Automated qualification scoring", "Smart routing & assignment", "Follow-up sequences"],
  },
  {
    id: "agents",
    icon: Bot,
    label: "AI Agents",
    title: "Autonomous Voice AI Agents",
    desc: "Deploy 24/7 AI agents that answer calls, handle objections, and book appointments with human-like conversation quality.",
    bullets: ["Natural language understanding", "Objection handling", "Calendar booking", "CRM data entry"],
  },
  {
    id: "consulting",
    icon: Users,
    label: "Consulting",
    title: "Revenue Operations Consulting",
    desc: "Our team audits your revenue pipeline, identifies leaks, and architects a custom automation strategy tailored to your business.",
    bullets: ["Revenue leak audit", "Process optimization", "Tech stack advisory", "Implementation roadmap"],
  },
  {
    id: "research",
    icon: FlaskConical,
    label: "Research",
    title: "AI Research & Development",
    desc: "Stay ahead with custom-trained models, prompt engineering frameworks, and cutting-edge AI integrations built for your industry.",
    bullets: ["Custom model training", "R-O-C-E prompt framework", "Industry-specific fine-tuning", "Performance benchmarking"],
  },
];

const ServicesSection = () => {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <section id="services" className="py-32 md:py-40 relative noise-overlay">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              What We Do
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Our Services
            </h2>
          </Reveal>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {services.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-wide transition-all duration-300 ${
                active === i
                  ? "text-primary"
                  : "text-silver hover:text-silver-bright"
              }`}
            >
              {active === i && (
                <motion.span
                  layoutId="service-tab"
                  className="absolute inset-0 rounded-full bg-primary/8 border border-primary/15"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <s.icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{s.label}</span>
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
            <div className="surface-card rounded-2xl p-10 md:p-14 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-br-full pointer-events-none" />

              <div className="relative grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-6">
                    <current.icon className="h-5 w-5 text-primary/70" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 tracking-tight">
                    {current.title}
                  </h3>
                  <p className="text-silver leading-relaxed mb-8">{current.desc}</p>
                  <Button variant="neon" size="lg" asChild>
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                      Book a Call
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <ul className="space-y-4">
                  {current.bullets.map((b, j) => (
                    <motion.li
                      key={b}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.08, duration: 0.4 }}
                      className="flex items-center gap-3 text-sm text-silver-bright font-mono"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServicesSection;
