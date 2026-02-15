import Reveal from "@/components/Reveal";
import { AlertTriangle, PhoneOff, Clock } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: PhoneOff, value: "67%", label: "of callers hang up on voicemail", color: "text-warning" },
  { icon: Clock, value: "5 min", label: "response delay = 80% drop in conversion", color: "text-warning" },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="py-28 md:py-36 relative">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />
            <span className="text-xs tracking-[0.25em] uppercase text-warning font-mono">
              Revenue Leak Detected
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-silver-bright mb-16 tracking-tight">
            The Revenue Leak
          </h2>
        </Reveal>

        {/* Warning dashboard cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {stats.map((s, i) => (
            <Reveal key={s.value} delay={0.15 + i * 0.1}>
              <div className="surface-card rounded-xl p-8 relative overflow-hidden group hover:border-warning/30 transition-all duration-500 warning-glow">
                {/* Dashboard scan line effect */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/50 to-transparent" />
                <s.icon className="h-7 w-7 text-warning mb-5" />
                <p className="text-5xl md:text-6xl font-mono font-bold text-foreground mb-3 tracking-tight">
                  {s.value}
                </p>
                <p className="text-silver text-lg leading-relaxed">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="max-w-3xl surface-card rounded-xl p-8 border-l-2 border-l-warning/50">
            <p className="text-lg text-silver leading-relaxed">
              Your business is bleeding money in 5-minute increments. You don't need
              more leads.{" "}
              <span className="text-foreground font-medium">
                You need an infrastructure that captures the ones you already have.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ProblemSection;
