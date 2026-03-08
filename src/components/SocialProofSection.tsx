import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Quote, Star, TrendingUp, Clock, PhoneCall } from "lucide-react";

const metrics = [
  { icon: TrendingUp, value: "+40%", label: "More Booked Jobs" },
  { icon: Clock, value: "15+", label: "Hours/Week Saved" },
  { icon: PhoneCall, value: "2,400+", label: "Calls Handled/Month" },
];

const testimonials = [
  {
    quote: "We were losing 40% of our after-hours calls. Now our AI answers every single one and books the job. Revenue is up 35% in 60 days.",
    name: "Marcus D.",
    role: "Owner",
    company: "Premier Plumbing Co.",
  },
  {
    quote: "Our lead response time went from 4 hours to under 1 second. The ROI was insane from month one. Best investment we've made.",
    name: "Sarah K.",
    role: "CEO",
    company: "Comfort Zone HVAC",
  },
  {
    quote: "Voxmation replaced our answering service and it's not even close. The AI qualifies leads better than our $15/hr receptionist did.",
    name: "James R.",
    role: "Owner",
    company: "R&R Electrical Services",
  },
  {
    quote: "We went from missing 60% of storm-season calls to capturing every single one. Booked 312% more inspections last quarter.",
    name: "Mike T.",
    role: "Operations Manager",
    company: "StormShield Roofing",
  },
  {
    quote: "No-shows dropped by 89% after we deployed the AI reminder system. Patients love it. Staff loves it. Revenue loves it.",
    name: "Dr. Patel",
    role: "Practice Owner",
    company: "Bright Smile Dental",
  },
  {
    quote: "We signed 3x more cases last quarter because Voxmation responds to inquiries instantly. First to respond wins in legal.",
    name: "Chris W.",
    role: "Managing Partner",
    company: "Westbrook Law Group",
  },
];

const logos = ["ServiceTitan", "Jobber", "HubSpot", "GoHighLevel", "Housecall Pro", "Calendly"];

const SocialProofSection = () => {
  return (
    <section id="results" className="py-32 md:py-40 overflow-hidden relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Metrics highlight */}
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
              Real Results
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright tracking-[-0.02em]">
              What Our Clients Say
            </h2>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.4 } }}
                className="surface-card rounded-2xl p-7 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 text-warning fill-warning" />
                  ))}
                </div>

                <Quote className="h-4 w-4 text-primary/20 mb-3" />

                <p className="text-sm text-foreground font-light leading-relaxed mb-6 font-display">
                  "{t.quote}"
                </p>

                <div className="border-t border-border/50 pt-4 mt-auto">
                  <p className="text-xs text-silver-bright font-mono tracking-wide">{t.name}</p>
                  <p className="text-[10px] text-silver font-mono mt-0.5">
                    {t.role} · {t.company}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Logo ticker */}
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
