import { Search, Link, Rocket, Settings } from "lucide-react";

const steps = [
  {
    icon: Search,
    label: "DIAGNOSE",
    description: "We audit your revenue leaks.",
  },
  {
    icon: Link,
    label: "INTEGRATE",
    description: "We connect to your CRM (HubSpot/Zoho) without breaking it.",
  },
  {
    icon: Rocket,
    label: "GENERATE",
    description: "Go-Live. Immediate lead recovery.",
  },
  {
    icon: Settings,
    label: "OPTIMIZE",
    description: "Weekly AI tuning based on conversation data.",
  },
];

const MethodologySection = () => {
  return (
    <section id="methodology" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4">
        <span className="text-xs font-mono tracking-widest uppercase text-primary mb-4 block">
          Methodology
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright mb-16">
          The DIGO Framework
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.label} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-primary/40 to-transparent z-0" />
              )}

              <div className="glass-card rounded-lg p-6 text-center relative z-10 h-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-4 bg-background">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs font-mono tracking-widest text-primary mb-2 block">
                  0{i + 1}
                </span>
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {step.label}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
