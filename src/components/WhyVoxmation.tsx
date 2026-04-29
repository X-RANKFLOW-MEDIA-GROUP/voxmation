import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface WhyVoxmationProps {
  title?: string;
  subtitle?: string;
  reasons?: Array<{
    title: string;
    description: string;
  }>;
  variant?: "grid" | "list";
}

const DEFAULT_REASONS = [
  {
    title: "No Long-Term Contracts",
    description: "Month-to-month, cancel anytime. We believe in proving our value, not locking you in.",
  },
  {
    title: "Live in 7-14 Days",
    description: "Fastest setup in the industry. We handle everything — integration, training, testing, launch.",
  },
  {
    title: "24/7 Missed Call Recovery",
    description: "Every missed call triggers an instant SMS and callback attempt within seconds.",
  },
  {
    title: "Full CRM Sync",
    description: "Every lead is automatically logged to your CRM — ServiceTitan, Jobber, HubSpot, GoHighLevel, and more.",
  },
  {
    title: "40%+ ROI in 30 Days",
    description: "Most home service businesses break even within 30 days. Profitable from month one.",
  },
  {
    title: "White-Glove Support",
    description: "Dedicated account manager. Not a chatbot. Real people who understand your business.",
  },
];

const WhyVoxmation = ({
  title = "Why Choose Voxmation",
  subtitle = "Built for home service businesses that are serious about growth.",
  reasons = DEFAULT_REASONS,
  variant = "grid",
}: WhyVoxmationProps) => {
  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Why Voxmation
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">{subtitle}</p>
          </Reveal>
        </div>

        {variant === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reasons.map((reason, i) => (
              <Reveal key={reason.title} delay={0.08 * i} scale>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
                >
                  {/* Animated top border glow */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-500 relative z-10">
                    <Check className="h-5 w-5 text-primary/80 group-hover:text-primary/100 transition-colors duration-500" />
                  </div>

                  <h3 className="text-lg font-display font-semibold text-foreground mb-3 tracking-tight relative z-10">
                    {reason.title}
                  </h3>
                  <p className="text-silver text-sm leading-relaxed relative z-10">{reason.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {reasons.map((reason, i) => (
              <Reveal key={reason.title} delay={0.05 * i}>
                <motion.div
                  whileHover={{ x: 8 }}
                  className="surface-card rounded-2xl p-6 md:p-8 flex gap-4 md:gap-6 group hover:border-primary/15 transition-all duration-500"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-500">
                    <Check className="h-3.5 w-3.5 text-primary/80 group-hover:text-primary/100 transition-colors duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-silver text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WhyVoxmation;
