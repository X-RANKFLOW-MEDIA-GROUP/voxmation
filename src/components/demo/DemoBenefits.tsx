import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarCheck, Clock, ShieldCheck, TrendingUp, ArrowUpRight, Mic } from "lucide-react";

const benefits = [
  {
    icon: CalendarCheck,
    title: "More Booked Jobs",
    stat: "3.2x",
    desc: "More appointments with automated follow-up and 24/7 booking — no receptionist needed.",
  },
  {
    icon: Clock,
    title: "Faster Response Time",
    stat: "<30s",
    desc: "Every missed call or new lead gets a response within 30 seconds via AI-powered SMS.",
  },
  {
    icon: ShieldCheck,
    title: "Fewer Lost Leads",
    stat: "98%",
    desc: "98% capture rate — no lead goes unanswered, even after hours or on weekends.",
  },
  {
    icon: TrendingUp,
    title: "Higher ROI",
    stat: "847%",
    desc: "Average 847% return in the first quarter. The system pays for itself in month one.",
  },
];

const DemoBenefits = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-32 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-muted-foreground mb-4">
            Why Voxmation
          </p>
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-foreground mb-3">
            Results that speak for themselves.
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto font-light leading-relaxed">
            Every dollar invested comes back multiplied. Every call becomes an opportunity.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="group surface-card rounded-2xl p-7 relative overflow-hidden hover:border-foreground/10 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl border border-border bg-foreground/[0.03] flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-foreground/60" />
                </div>
                <span className="font-display font-extrabold text-2xl text-foreground tracking-tight">{b.stat}</span>
              </div>

              <h3 className="font-display font-bold text-foreground text-base mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-[0.85rem] leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="surface-card rounded-2xl p-10 sm:p-14 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(0_0%_100%/0.02),transparent)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

            <div className="relative z-10">
              <h3 className="font-display font-extrabold text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08] tracking-[-0.04em] text-foreground mb-4">
                Ready to put your phone on autopilot?
              </h3>
              <p className="text-muted-foreground text-[0.95rem] leading-relaxed mb-8 max-w-md mx-auto font-light">
                Schedule a personalized demo and see how Voxmation can turn missed calls into revenue — in under 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://cal.com/voxmation/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-foreground text-background font-display font-bold rounded-xl py-4 px-8 text-sm flex items-center justify-center gap-2.5 shadow-[0_0_40px_hsl(0_0%_100%/0.08)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_hsl(0_0%_100%/0.12)] transition-all"
                >
                  Schedule Free Demo
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#voice-demo"
                  className="border border-border text-foreground/70 font-display font-semibold rounded-xl py-4 px-8 text-sm flex items-center justify-center gap-2 hover:border-foreground/15 hover:text-foreground transition-all"
                >
                  <Mic className="w-4 h-4" />
                  Hear the AI Agent first
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoBenefits;
