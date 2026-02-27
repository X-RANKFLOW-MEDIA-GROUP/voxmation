import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const logos = ["HubSpot", "Twilio", "OpenAI", "Vapi", "Zapier", "Calendly"];

const testimonials = [
  {
    quote: "They didn't just build a bot. They installed a machine that replaced 15 hours of admin work per week.",
    name: "Marcus D.",
    role: "Operations Director",
    company: "Multi-Location SMB",
  },
  {
    quote: "Our lead response time went from 4 hours to under 1 second. The ROI was insane from month one.",
    name: "Sarah K.",
    role: "CEO",
    company: "Home Services Co.",
  },
  {
    quote: "We went from missing 40% of after-hours calls to capturing every single one. Game changer.",
    name: "James R.",
    role: "Owner",
    company: "Regional Plumbing",
  },
  {
    quote: "The AI qualification is scary accurate. It filters tire-kickers better than our senior reps.",
    name: "Linda T.",
    role: "Sales Manager",
    company: "Real Estate Brokerage",
  },
  {
    quote: "No-shows dropped by 89% after we deployed the AI reminder system. Patients love it.",
    name: "Dr. Patel",
    role: "Practice Owner",
    company: "Dental Group",
  },
  {
    quote: "Voxmation didn't just automate our calls — they re-engineered our entire revenue pipeline.",
    name: "Chris W.",
    role: "COO",
    company: "Healthcare Network",
  },
];

const SocialProofSection = () => {
  return (
    <section className="py-32 md:py-40 overflow-hidden relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 mb-20 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Testimonials
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright tracking-[-0.02em]">
              Trusted Infrastructure
            </h2>
          </Reveal>
        </div>

        {/* Testimonial grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.4 } }}
                className="surface-card rounded-2xl p-7 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 text-primary/40 fill-primary/40" />
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
      </div>

      {/* Logo ticker */}
      <div className="relative mt-12">
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
    </section>
  );
};

export default SocialProofSection;
