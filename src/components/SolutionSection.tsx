import Reveal from "@/components/Reveal";
import { AudioLines, MessageSquare, FileText, Brain, Cpu, Calendar, CreditCard, Link2 } from "lucide-react";

const layers = [
  {
    num: "01",
    title: "CAPTURE",
    desc: "We catch traffic everywhere.",
    icons: [
      { icon: AudioLines, label: "Voice" },
      { icon: MessageSquare, label: "WhatsApp" },
      { icon: FileText, label: "Web Form" },
    ],
  },
  {
    num: "02",
    title: "INTELLIGENCE",
    desc: "Proprietary R-O-C-E Prompt Framework filters tire-kickers.",
    icons: [
      { icon: Brain, label: "AI Brain" },
      { icon: Cpu, label: "Processing" },
    ],
  },
  {
    num: "03",
    title: "ACTION",
    desc: "Autonomous booking and data entry.",
    icons: [
      { icon: Link2, label: "CRM" },
      { icon: Calendar, label: "Calendar" },
      { icon: CreditCard, label: "Payments" },
    ],
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-28 md:py-36">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.25em] uppercase text-primary font-mono block mb-3">
            The Stack
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-silver-bright mb-6 tracking-tight">
            3-Layer Revenue Engine
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver mb-16 max-w-xl">
            A stacked technical architecture designed to capture, qualify, and convert — autonomously.
          </p>
        </Reveal>

        {/* Blueprint stack */}
        <div className="space-y-4">
          {layers.map((layer, i) => (
            <Reveal key={layer.num} delay={0.1 * i}>
              <div className="surface-card rounded-xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                {/* Blueprint line accent */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />

                <div className="text-5xl font-mono font-bold text-primary/15 shrink-0 w-20 group-hover:text-primary/25 transition-colors">
                  {layer.num}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-xl md:text-2xl font-mono font-bold text-foreground tracking-wide">
                    {layer.title}<span className="text-primary">.</span>
                  </h3>
                  <p className="text-silver text-base">{layer.desc}</p>
                </div>

                <div className="flex gap-3">
                  {layer.icons.map((item, j) => (
                    <div
                      key={j}
                      className="w-12 h-12 rounded-lg border border-border flex items-center justify-center bg-background group-hover:border-primary/20 transition-colors"
                      title={item.label}
                    >
                      <item.icon className="h-5 w-5 text-primary/70" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
