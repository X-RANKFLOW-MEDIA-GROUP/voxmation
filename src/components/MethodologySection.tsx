import Reveal from "@/components/Reveal";
import { Search, Link2, Rocket, Settings } from "lucide-react";

const steps = [
  { icon: Search, letter: "D", label: "DIAGNOSE", desc: "We audit your revenue leaks." },
  { icon: Link2, letter: "I", label: "INTEGRATE", desc: "We connect to your CRM (HubSpot/Zoho) without breaking it." },
  { icon: Rocket, letter: "G", label: "GENERATE", desc: "Go-Live. Immediate lead recovery." },
  { icon: Settings, letter: "O", label: "OPTIMIZE", desc: "Weekly AI tuning based on conversation data." },
];

const MethodologySection = () => {
  return (
    <section id="methodology" className="py-28 md:py-36">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.25em] uppercase text-primary font-mono block mb-3">
            Methodology
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-silver-bright mb-16 tracking-tight">
            The DIGO Framework
          </h2>
        </Reveal>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent hidden md:block" />
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent md:hidden" />

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => (
              <Reveal key={step.letter} delay={0.1 * i}>
                <div className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}>
                  {/* Node */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center z-10">
                    <span className="text-primary font-mono font-bold text-sm">{step.letter}</span>
                  </div>

                  {/* Content */}
                  <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? "md:text-right md:pr-0" : "md:text-left md:pl-0"}`}>
                    <div className={`surface-card rounded-xl p-7 hover:border-primary/20 transition-all duration-500 ${
                      i % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                    } max-w-md`}>
                      <div className="flex items-center gap-3 mb-3">
                        <step.icon className="h-5 w-5 text-primary" />
                        <span className="text-xs font-mono tracking-widest text-primary">
                          STEP 0{i + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-mono font-bold text-foreground mb-2 tracking-wide">
                        {step.label}
                      </h3>
                      <p className="text-silver text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
