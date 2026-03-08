import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Zap, PhoneOff, CalendarCheck, UserCheck, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Speed to Lead",
    desc: "Respond to every inquiry in under 1 second. The first business to respond wins 78% of the time.",
    metric: "< 1s",
  },
  {
    icon: PhoneOff,
    title: "No Missed Calls",
    desc: "Your AI picks up every single call — nights, weekends, holidays. No voicemail, no lost revenue.",
    metric: "0%",
  },
  {
    icon: CalendarCheck,
    title: "More Booked Jobs",
    desc: "Automated booking fills your calendar without lifting a finger. More appointments, more revenue.",
    metric: "+40%",
  },
  {
    icon: UserCheck,
    title: "Better Follow-Up",
    desc: "Multi-channel nurturing ensures every lead gets the right message at the right time. No one slips through.",
    metric: "100%",
  },
  {
    icon: TrendingUp,
    title: "Higher ROI",
    desc: "Most clients see positive ROI within 30 days. No long-term contracts — results speak for themselves.",
    metric: "30 days",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Why Voxmation
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              The Voxmation Advantage
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              Stop losing revenue to missed calls and slow follow-ups. Here's what changes when you go live.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-7 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500 text-center"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="text-3xl font-mono font-bold text-warning mb-4 tracking-tight">
                  {b.metric}
                </div>

                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/12 transition-all duration-500">
                  <b.icon className="h-5 w-5 text-primary/60" />
                </div>

                <h3 className="text-base font-display font-semibold text-foreground mb-2 tracking-tight">
                  {b.title}
                </h3>
                <p className="text-silver text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
