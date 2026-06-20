import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Quote, TrendingUp, Clock, PhoneCall } from "lucide-react";

// Product capability highlights (not customer results). These describe what the
// platform does, not unverified performance statistics.
const metrics = [
  { icon: PhoneCall, value: "24/7", label: "Calls Answered" },
  { icon: Clock, value: "<2s", label: "Response Time" },
  { icon: TrendingUp, value: "100%", label: "Calls Captured" },
];

// Illustrative use cases by industry — not testimonials from named individuals.
const highlights = [
  {
    tag: "Plumbing",
    headline: "Answer every after-hours emergency",
    detail: "A burst-pipe call at midnight is answered, triaged by urgency, and booked — instead of going to voicemail and a competitor.",
  },
  {
    tag: "HVAC",
    headline: "Capture peak-season demand",
    detail: "When a heat wave spikes call volume, the AI answers unlimited concurrent calls so no service request is missed.",
  },
  {
    tag: "Electrical",
    headline: "Qualify leads instantly",
    detail: "The AI screens safety-critical calls, scores urgency, and routes the right leads to your team in seconds.",
  },
  {
    tag: "Roofing",
    headline: "Survive the storm surge",
    detail: "After a hailstorm, every inbound lead is captured, qualified for insurance vs. retail, and booked for an inspection.",
  },
  {
    tag: "Medical Spa",
    headline: "Reduce no-shows",
    detail: "Automated confirmations and reminder sequences help keep your calendar full and reduce missed appointments.",
  },
  {
    tag: "Legal Intake",
    headline: "Be first to respond",
    detail: "Prospective-client calls are answered and qualified 24/7, so your firm responds before the competition.",
  },
];

const logos = ["ServiceTitan", "Jobber", "HubSpot", "GoHighLevel", "Housecall Pro", "Calendly"];

const SocialProofSection = () => {
  return (
    <section id="results" className="py-32 md:py-40 overflow-hidden relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Capability highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-4xl mx-auto">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={0.1 * i} scale>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="surface-card rounded-2xl p-8 text-center relative overflow-hidden group hover:border-warning/20 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/30 to-transparent" />
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <m.icon className="h-5 w-5 text-warning" />
                </div>
                <p className="text-4xl md:text-5xl font-mono font-bold text-warning mb-2 tracking-tight">{m.value}</p>
                <p className="text-silver text-sm font-mono">{m.label}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Use Cases
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright tracking-[-0.02em]">
              What VOXmatiON Delivers
            </h2>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {highlights.map((h, i) => (
            <Reveal key={h.headline} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.4 } }}
                className="surface-card rounded-2xl p-7 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <p className="text-[10px] text-primary/70 font-mono uppercase tracking-wider mb-4">{h.tag}</p>

                <Quote className="h-4 w-4 text-primary/20 mb-3" />

                <p className="text-base text-foreground font-light leading-relaxed mb-4 font-display">
                  {h.headline}
                </p>

                <div className="border-t border-border/50 pt-4 mt-auto">
                  <p className="text-xs text-silver leading-relaxed">{h.detail}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Integration logo ticker */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-ticker">
            {[...Array(4)].flatMap((_, setIdx) =>
              logos.map((logo, i) => (
                <div key={`${setIdx}-${i}`} className="shrink-0 mx-16 flex items-center justify-center h-16">
                  <span className="text-lg font-mono font-bold text-muted-foreground/15 tracking-[0.15em] whitespace-nowrap uppercase hover:text-muted-foreground/30 transition-colors duration-700">
                    {logo}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
