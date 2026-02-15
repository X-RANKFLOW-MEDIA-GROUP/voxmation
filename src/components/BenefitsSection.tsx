import Reveal from "@/components/Reveal";
import { BarChart3, TrendingUp, Puzzle } from "lucide-react";

const benefits = [
  {
    icon: BarChart3,
    title: "Real-Time Intelligence",
    desc: "Access accurate, real-time data to drive smarter decisions",
  },
  {
    icon: TrendingUp,
    title: "Measurable Impact",
    desc: "Track performance, uncover insights, and achieve data-backed growth",
  },
  {
    icon: Puzzle,
    title: "Seamless Integration",
    desc: "Connect tools, teams, and workflows with intelligent automation",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.2em] uppercase text-silver block mb-4">
            Benefits
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4">
            Why Choose Us?
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver mb-16 max-w-lg">
            Everything you need to automate, optimize, and scale
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={0.1 * i}>
              <div className="surface-card rounded-2xl p-8 h-full group hover:bg-accent/50 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <b.icon className="h-5 w-5 text-silver-bright" />
                </div>
                <h3 className="text-lg font-display font-medium text-foreground mb-3">
                  {b.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
