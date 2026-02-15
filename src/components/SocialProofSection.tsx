import Reveal from "@/components/Reveal";

const logos = ["HubSpot", "Twilio", "OpenAI", "Vapi"];

const SocialProofSection = () => {
  return (
    <section className="py-28 md:py-36 overflow-hidden">
      <div className="container mx-auto px-6 mb-16">
        <Reveal>
          <span className="text-xs tracking-[0.25em] uppercase text-primary font-mono block mb-3 text-center">
            The Visionaries
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-mono font-bold text-silver-bright mb-16 text-center tracking-tight">
            Trusted Infrastructure
          </h2>
        </Reveal>

        {/* Testimonial */}
        <Reveal delay={0.2}>
          <div className="surface-card rounded-2xl p-10 md:p-14 max-w-3xl mx-auto text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="text-5xl text-primary/20 font-display mb-4">"</div>
            <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed mb-8 italic">
              They didn't just build a bot. They installed a machine that replaced
              15 hours of admin work per week.
            </p>
            <div>
              <p className="text-sm text-silver-bright font-mono">— Operations Director</p>
              <p className="text-xs text-silver font-mono">Multi-Location SMB</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Logo ticker */}
      <div className="relative mt-12">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-ticker">
          {[...Array(4)].flatMap((_, setIdx) =>
            logos.map((logo, i) => (
              <div key={`${setIdx}-${i}`} className="shrink-0 mx-14 flex items-center justify-center h-14">
                <span className="text-xl font-mono font-bold text-muted-foreground/25 tracking-wider whitespace-nowrap uppercase">
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
