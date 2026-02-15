import { AudioLines, Brain, Cpu, Calendar, CreditCard, Globe } from "lucide-react";

const layers = [
  {
    number: "01",
    title: "CAPTURE",
    description: "We catch traffic everywhere.",
    icons: [AudioLines, Globe, Globe],
    labels: ["Voice Waveform", "WhatsApp", "Web Forms"],
    color: "text-primary",
  },
  {
    number: "02",
    title: "INTELLIGENCE",
    description: "Proprietary R-O-C-E Prompt Framework filters tire-kickers.",
    icons: [Brain, Cpu],
    labels: ["AI Brain", "Processing"],
    color: "text-primary",
  },
  {
    number: "03",
    title: "ACTION",
    description: "Autonomous booking and data entry.",
    icons: [Globe, Calendar, CreditCard],
    labels: ["CRM Sync", "Calendar", "Payments"],
    color: "text-primary",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4">
        <span className="text-xs font-mono tracking-widest uppercase text-primary mb-4 block">
          The Stack
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright mb-16">
          3-Layer Revenue Engine
        </h2>

        <div className="space-y-6">
          {layers.map((layer) => (
            <div
              key={layer.number}
              className="glass-card glass-card-hover rounded-lg p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-300"
            >
              {/* Number */}
              <div className="text-5xl font-mono font-bold text-primary/20 shrink-0 w-20">
                {layer.number}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-display font-bold text-foreground tracking-wide">
                  {layer.title}
                </h3>
                <p className="text-muted-foreground text-lg">{layer.description}</p>
              </div>

              {/* Icons */}
              <div className="flex gap-4">
                {layer.icons.map((Icon, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-lg border border-border flex items-center justify-center bg-background"
                  >
                    <Icon className={`h-5 w-5 ${layer.color}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
