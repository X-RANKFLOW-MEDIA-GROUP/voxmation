import Reveal from "@/components/Reveal";
import { AudioLines, MessageSquare, FileText, Brain, Cpu, Calendar, CreditCard, Link2, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const layers = [
  {
    num: "01",
    title: "CAPTURE",
    desc: "We catch traffic everywhere — every inbound call, message, and form submission is captured instantly.",
    icons: [
      { icon: AudioLines, label: "Voice" },
      { icon: MessageSquare, label: "WhatsApp" },
      { icon: FileText, label: "Web Form" },
    ],
    gradient: "from-primary/8 to-transparent",
  },
  {
    num: "02",
    title: "INTELLIGENCE",
    desc: "Proprietary R-O-C-E Prompt Framework filters tire-kickers and qualifies genuine opportunities in real time.",
    icons: [
      { icon: Brain, label: "AI Brain" },
      { icon: Cpu, label: "Processing" },
    ],
    gradient: "from-[hsl(190,70%,42%)]/8 to-transparent",
  },
  {
    num: "03",
    title: "ACTION",
    desc: "Autonomous booking and data entry. CRM updated, calendar booked, payment collected — zero human touch.",
    icons: [
      { icon: Link2, label: "CRM" },
      { icon: Calendar, label: "Calendar" },
      { icon: CreditCard, label: "Payments" },
    ],
    gradient: "from-primary/8 to-transparent",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
            The Stack
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
            3-Layer Revenue Engine
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver text-lg mb-20 max-w-xl leading-relaxed">
            A stacked technical architecture designed to capture, qualify, and convert — autonomously.
          </p>
        </Reveal>

        {/* Blueprint stack */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {layers.map((layer, i) => (
            <div key={layer.num}>
              <Reveal delay={0.08 * i} scale>
                <motion.div 
                  whileHover={{ x: 8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-8 group hover:border-primary/15 transition-all duration-500 relative overflow-hidden cursor-default"
                >
                  {/* Left accent gradient */}
                  <div className={`absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r ${layer.gradient} pointer-events-none`} />
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-primary/20 group-hover:bg-primary/40 transition-colors" />

                  <div className="relative text-6xl font-mono font-bold text-primary/10 shrink-0 w-20 group-hover:text-primary/20 transition-colors duration-500">
                    {layer.num}
                  </div>

                  <div className="flex-1 space-y-2.5 relative">
                    <h3 className="text-xl md:text-2xl font-mono font-bold text-foreground tracking-wide">
                      {layer.title}<span className="text-primary">.</span>
                    </h3>
                    <p className="text-silver text-base leading-relaxed">{layer.desc}</p>
                  </div>

                  <div className="flex gap-3 relative">
                    {layer.icons.map((item, j) => (
                      <motion.div
                        key={j}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="w-12 h-12 rounded-xl border border-border flex items-center justify-center bg-background group-hover:border-primary/15 group-hover:bg-primary/3 transition-all duration-500"
                        title={item.label}
                      >
                        <item.icon className="h-5 w-5 text-primary/60 group-hover:text-primary/80 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </Reveal>

              {/* Connector arrow */}
              {i < layers.length - 1 && (
                <Reveal delay={0.08 * i + 0.04}>
                  <div className="flex justify-center py-2">
                    <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-primary/5 relative">
                      <ArrowDown className="h-3 w-3 text-primary/30 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
