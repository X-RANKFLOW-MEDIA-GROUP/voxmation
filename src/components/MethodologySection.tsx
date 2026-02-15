import Reveal from "@/components/Reveal";
import { Search, Link2, Rocket, Settings } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Search, letter: "D", label: "DIAGNOSE", desc: "We audit your revenue leaks with data-driven precision. No guesswork — just clear insight into what's costing you." },
  { icon: Link2, letter: "I", label: "INTEGRATE", desc: "We connect to your CRM (HubSpot/Zoho) without breaking it. Seamless, zero-downtime deployment." },
  { icon: Rocket, letter: "G", label: "GENERATE", desc: "Go-Live. Immediate lead recovery. Your AI agent starts working the moment we flip the switch." },
  { icon: Settings, letter: "O", label: "OPTIMIZE", desc: "Weekly AI tuning based on live conversation data. Your system gets smarter every single day." },
];

const MethodologySection = () => {
  return (
    <section id="methodology" className="py-32 md:py-40 relative noise-overlay">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-60" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Methodology
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright tracking-[-0.02em]">
              The DIGO Framework
            </h2>
          </Reveal>
        </div>

        {/* Horizontal steps on desktop, vertical on mobile */}
        <div className="grid md:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <Reveal key={step.letter} delay={0.1 * i} scale>
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Step number */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center group-hover:bg-primary/12 group-hover:border-primary/25 transition-all duration-500">
                    <span className="text-primary font-mono font-bold text-sm">{step.letter}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground tracking-wider">
                    0{i + 1}
                  </span>
                </div>

                <step.icon className="h-5 w-5 text-primary/50 mb-4 group-hover:text-primary/70 transition-colors" />
                
                <h3 className="text-lg font-mono font-bold text-foreground mb-3 tracking-wide">
                  {step.label}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{step.desc}</p>

                {/* Bottom connector line on desktop */}
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

export default MethodologySection;
