import Reveal from "@/components/Reveal";
import { AlertTriangle, PhoneOff, Clock, TrendingDown } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      start = start || timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const stats = [
  { 
    icon: PhoneOff, 
    value: 67, 
    suffix: "%", 
    label: "of callers hang up on voicemail",
    detail: "Every missed call is lost revenue"
  },
  { 
    icon: Clock, 
    value: 80, 
    suffix: "%", 
    label: "drop in conversion after 5-min delay",
    detail: "Speed-to-lead wins every time"
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-warning/20 bg-warning/5 mb-6">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs tracking-[0.15em] uppercase text-warning font-mono">
              Revenue Leak Detected
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-20 tracking-[-0.02em] max-w-3xl">
            The Revenue Leak
          </h2>
        </Reveal>

        {/* Warning dashboard cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {stats.map((s, i) => (
            <Reveal key={s.value} delay={0.15 + i * 0.12} scale>
              <motion.div 
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="surface-card rounded-2xl p-8 md:p-10 relative overflow-hidden group hover:border-warning/20 transition-all duration-500"
              >
                {/* Scan line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/40 to-transparent" />
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-warning/5 to-transparent rounded-bl-full" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-warning" />
                  </div>
                  <span className="text-xs font-mono text-warning/70 tracking-wider uppercase">{s.detail}</span>
                </div>
                
                <p className="text-6xl md:text-7xl font-mono font-bold text-foreground mb-4 tracking-tight">
                  <CountUp target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-silver text-lg leading-relaxed">{s.label}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <div className="max-w-3xl surface-card rounded-2xl p-8 md:p-10 border-l-2 border-l-warning/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-warning/3 to-transparent pointer-events-none" />
            <div className="relative">
              <TrendingDown className="h-5 w-5 text-warning mb-4" />
              <p className="text-lg md:text-xl text-silver leading-relaxed">
                Your business is bleeding money in 5-minute increments. You don't need
                more leads.{" "}
                <span className="text-foreground font-medium">
                  You need an infrastructure that captures the ones you already have.
                </span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ProblemSection;
