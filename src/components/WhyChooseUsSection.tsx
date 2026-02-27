import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Zap, BarChart3, Plug } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Real-Time Intelligence",
    desc: "Our AI processes conversations in real-time, qualifying leads and making decisions faster than any human team could.",
  },
  {
    icon: BarChart3,
    title: "Measurable Impact",
    desc: "Every interaction is tracked, measured, and optimized. You'll see exactly how much revenue your system is generating.",
  },
  {
    icon: Plug,
    title: "Seamless Integration",
    desc: "Connects to your existing CRM, calendar, and payment systems without disrupting your current workflow.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section id="why-us" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              The Advantage
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Why Choose Voxmation
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              We don't just build bots. We engineer revenue infrastructure that scales.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={0.1 * i} scale>
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-8 lg:p-10 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-8 group-hover:bg-primary/12 group-hover:border-primary/25 transition-all duration-500">
                  <b.icon className="h-6 w-6 text-primary/70" />
                </div>

                <h3 className="text-xl font-display font-bold text-foreground mb-4 tracking-tight">
                  {b.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
