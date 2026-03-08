import Reveal from "@/components/Reveal";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "24/7 Call Answering", vox: true, receptionist: false, voicemail: false },
  { feature: "Instant Lead Response (<1s)", vox: true, receptionist: false, voicemail: false },
  { feature: "Automated Booking", vox: true, receptionist: false, voicemail: false },
  { feature: "Missed Call Text Back", vox: true, receptionist: false, voicemail: false },
  { feature: "CRM Auto-Sync", vox: true, receptionist: false, voicemail: false },
  { feature: "Lead Qualification", vox: true, receptionist: true, voicemail: false },
  { feature: "Multi-Channel Follow-Up", vox: true, receptionist: false, voicemail: false },
  { feature: "No Sick Days / No Training", vox: true, receptionist: false, voicemail: true },
  { feature: "Handles Unlimited Calls", vox: true, receptionist: false, voicemail: true },
  { feature: "Cost Under $500/mo", vox: true, receptionist: false, voicemail: true },
];

const Cell = ({ active }: { active: boolean }) => (
  <div className="flex justify-center">
    {active ? (
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-primary" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    )}
  </div>
);

const ComparisonSection = () => {
  return (
    <section id="comparison" className="py-32 md:py-40 relative noise-overlay">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              The Difference
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Why Voxmation Wins
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              See how AI-powered automation stacks up against traditional methods.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="max-w-3xl mx-auto surface-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 text-center border-b border-border px-4 md:px-6 py-5">
              <span className="text-xs font-mono text-silver tracking-wider text-left">Feature</span>
              <span className="text-xs font-mono text-primary tracking-[0.1em] uppercase font-bold">Voxmation</span>
              <span className="text-xs font-mono text-silver tracking-wider">Receptionist</span>
              <span className="text-xs font-mono text-silver tracking-wider">Voicemail</span>
            </div>

            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 items-center text-center px-4 md:px-6 py-4 ${
                  i < rows.length - 1 ? "border-b border-border/50" : ""
                } hover:bg-primary/3 transition-colors duration-300`}
              >
                <span className="text-xs md:text-sm text-silver-bright text-left font-mono">{row.feature}</span>
                <Cell active={row.vox} />
                <Cell active={row.receptionist} />
                <Cell active={row.voicemail} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ComparisonSection;
