import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Phone, Clock, Brain, BarChart3, Shield, Headphones } from "lucide-react";

const features = [
  { icon: Phone, title: "24/7 Call Handling", desc: "Never miss a call again. Your AI agent works around the clock, every day of the year." },
  { icon: Clock, title: "Sub-Second Response", desc: "Lead response time under 1 second. Beat every competitor to the punch." },
  { icon: Brain, title: "Smart Qualification", desc: "AI-powered lead scoring filters out tire-kickers and surfaces high-intent buyers." },
  { icon: BarChart3, title: "Live Analytics", desc: "Real-time dashboards showing call volume, conversion rates, and revenue impact." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 ready infrastructure with encrypted data handling and compliance built-in." },
  { icon: Headphones, title: "Human-Like Voice", desc: "Advanced voice synthesis that sounds natural — callers won't know it's AI." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Capabilities
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Built for Revenue
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              Every feature is designed with one goal: turn more leads into booked appointments.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-7 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-all duration-500">
                  <f.icon className="h-4.5 w-4.5 text-primary/60 group-hover:text-primary/80 transition-colors" />
                </div>

                <h3 className="text-base font-display font-semibold text-foreground mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
