import Reveal from "@/components/Reveal";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "24/7 Availability", vox: true, others: false },
  { feature: "Sub-1s Response Time", vox: true, others: false },
  { feature: "Autonomous Booking", vox: true, others: false },
  { feature: "CRM Integration", vox: true, others: true },
  { feature: "Custom AI Training", vox: true, others: false },
  { feature: "Weekly Optimization", vox: true, others: false },
  { feature: "No Long-Term Contracts", vox: true, others: false },
  { feature: "Revenue Guarantee", vox: true, others: false },
];

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
              Voxmation vs Others
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="max-w-2xl mx-auto surface-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 text-center border-b border-border px-6 py-5">
              <span className="text-xs font-mono text-silver tracking-wider text-left">Feature</span>
              <span className="text-xs font-mono text-primary tracking-[0.15em] uppercase font-bold">Voxmation</span>
              <span className="text-xs font-mono text-silver tracking-wider">Others</span>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 items-center text-center px-6 py-4 ${
                  i < rows.length - 1 ? "border-b border-border/50" : ""
                } hover:bg-primary/3 transition-colors duration-300`}
              >
                <span className="text-sm text-silver-bright text-left font-mono">{row.feature}</span>
                <div className="flex justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <div className="flex justify-center">
                  {row.others ? (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary/50" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ComparisonSection;
