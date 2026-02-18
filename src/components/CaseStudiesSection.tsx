import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp, Clock, Phone } from "lucide-react";

const caseStudies = [
  {
    industry: "Home Services",
    title: "From Missed Calls to 24/7 Booking Machine",
    metric: "312%",
    metricLabel: "Increase in booked appointments",
    description:
      "A multi-location plumbing company was losing 40% of inbound calls after hours. We deployed a Voice AI agent that handles scheduling, qualification, and follow-ups autonomously.",
    results: ["Zero missed calls", "15 hrs/week admin time saved", "ROI positive in 3 weeks"],
    icon: Phone,
  },
  {
    industry: "Real Estate",
    title: "Speed-to-Lead That Actually Converts",
    metric: "<1s",
    metricLabel: "Average response time",
    description:
      "A brokerage with 12 agents needed instant lead response across Zillow, Realtor.com, and web forms. Our automation stack captures, qualifies, and routes leads in under a second.",
    results: ["68% lead-to-appointment rate", "3x pipeline growth", "Eliminated manual follow-up"],
    icon: TrendingUp,
  },
  {
    industry: "Healthcare",
    title: "Patient Intake on Autopilot",
    metric: "89%",
    metricLabel: "Reduction in no-shows",
    description:
      "A dental group with 4 locations struggled with no-shows and manual confirmations. We built an intelligent reminder and rebooking system powered by conversational AI.",
    results: ["2,400+ calls handled/month", "Staff freed for patient care", "98% patient satisfaction"],
    icon: Clock,
  },
];

const CaseStudiesSection = () => {
  return (
    <section id="case-studies" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Proven Results
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Case Studies
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              Real businesses. Real systems. Measurable impact.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {caseStudies.map((study, i) => (
            <Reveal key={study.title} delay={0.1 * i} scale>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="h-full"
              >
                <div className="rounded-2xl p-px h-full bg-border/60 hover:bg-primary/20 transition-colors duration-500">
                  <div className="surface-card rounded-2xl p-8 lg:p-9 h-full flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Industry badge */}
                    <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase mb-6">
                      {study.industry}
                    </span>

                    {/* Big metric */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-1">
                        <study.icon className="h-5 w-5 text-primary/60" />
                        <span className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                          {study.metric}
                        </span>
                      </div>
                      <p className="text-xs text-silver font-mono">{study.metricLabel}</p>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-display font-semibold text-silver-bright mb-4 tracking-tight leading-snug">
                      {study.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-silver leading-relaxed mb-8 flex-1">
                      {study.description}
                    </p>

                    {/* Results */}
                    <ul className="space-y-2 mb-0">
                      {study.results.map((r) => (
                        <li key={r} className="flex items-center gap-2 text-xs text-silver-bright font-mono">
                          <ArrowUpRight className="h-3 w-3 text-primary/50 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
