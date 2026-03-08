import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Search, Plug, Rocket } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "We Audit Your Workflow",
    desc: "We analyze your call flow, lead sources, and follow-up gaps to identify exactly where you're losing revenue.",
  },
  {
    num: "02",
    icon: Plug,
    title: "We Build & Connect",
    desc: "We deploy your AI Voice Agent, set up missed call recovery, connect your CRM, and automate your booking system.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "You Start Booking More Jobs",
    desc: "Within days, your AI is answering calls, following up with leads, and filling your calendar — 24/7, no extra staff.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 md:py-40 relative noise-overlay">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Simple Process
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              How It Works
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              Go from missed calls to a fully automated booking machine in 3 simple steps.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.1 * i} scale>
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-8 lg:p-10 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center group-hover:bg-primary/12 group-hover:border-primary/25 transition-all duration-500">
                    <step.icon className="h-6 w-6 text-primary/70" />
                  </div>
                  <span className="text-5xl font-mono font-bold text-primary/8 group-hover:text-primary/15 transition-colors duration-500">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-foreground mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{step.desc}</p>

                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-8 lg:w-10 h-px bg-gradient-to-r from-border to-transparent z-20" />
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
