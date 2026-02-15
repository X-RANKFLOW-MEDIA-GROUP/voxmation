import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const logos = ["HubSpot", "Twilio", "OpenAI", "Vapi", "Zapier", "Calendly"];

const SocialProofSection = () => {
  return (
    <section className="py-32 md:py-40 overflow-hidden relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 mb-20 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              The Visionaries
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright tracking-[-0.02em]">
              Trusted Infrastructure
            </h2>
          </Reveal>
        </div>

        {/* Testimonial */}
        <Reveal delay={0.2} scale>
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.4 } }}
            className="surface-card rounded-2xl p-10 md:p-16 max-w-3xl mx-auto text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 gradient-radial-section opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-8">
                <Quote className="h-5 w-5 text-primary/60" />
              </div>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground font-light leading-relaxed mb-10 font-display tracking-tight">
                "They didn't just build a bot. They installed a machine that replaced
                15 hours of admin work per week."
              </p>
              
              <div className="w-12 h-px bg-border mx-auto mb-6" />
              
              <p className="text-sm text-silver-bright font-mono tracking-wide">— Operations Director</p>
              <p className="text-xs text-silver font-mono mt-1">Multi-Location SMB</p>
            </div>
          </motion.div>
        </Reveal>
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
