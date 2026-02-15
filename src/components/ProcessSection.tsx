import Reveal from "@/components/Reveal";
import { Search, Link2, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const steps = [
  {
    num: "01",
    label: "Discover & Analyze",
    desc: "We audit your existing workflows, tools, and customer data to uncover inefficiencies and automation opportunities. Every system is mapped for clarity.",
    icon: Search,
  },
  {
    num: "02",
    label: "Build & Integrate",
    desc: "We design and build custom AI-powered automations that plug directly into your existing tools — no disruption, no downtime.",
    icon: Link2,
  },
  {
    num: "03",
    label: "Launch & Optimize",
    desc: "Go live with confidence. We monitor performance, fine-tune workflows, and scale what works — continuously improving your results.",
    icon: Rocket,
  },
];

const ProcessSection = () => {
  const [active, setActive] = useState(0);

  return (
    <section id="process" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.2em] uppercase text-silver block mb-4">
            Process
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4">
            Our Simple & Smart Process
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver mb-16 max-w-lg">
            Everything you need to collaborate, create, and scale, all in one place.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps list */}
          <div className="space-y-2">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={0.1 * i}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full text-left rounded-xl p-6 transition-all duration-500 ${
                    active === i
                      ? "surface-card bg-accent/50"
                      : "hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-xs tracking-widest text-silver">STEP {i + 1}</span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-foreground mb-2">
                    {step.label}
                  </h3>
                  <motion.div
                    initial={false}
                    animate={{ height: active === i ? "auto" : 0, opacity: active === i ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-silver text-sm leading-relaxed pt-1">
                      {step.desc}
                    </p>
                  </motion.div>
                </button>
              </Reveal>
            ))}
          </div>

          {/* Visual */}
          <Reveal delay={0.2}>
            <div className="surface-card rounded-2xl p-10 flex items-center justify-center min-h-[300px]">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {(() => {
                  const Icon = steps[active].icon;
                  return <Icon className="h-16 w-16 text-silver mx-auto mb-6" />;
                })()}
                <p className="text-5xl font-display font-bold text-foreground mb-2">
                  {steps[active].num}
                </p>
                <p className="text-silver">{steps[active].label}</p>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
