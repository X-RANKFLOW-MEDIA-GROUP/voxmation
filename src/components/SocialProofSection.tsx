const logos = ["HubSpot", "Twilio", "OpenAI", "Vapi", "HubSpot", "Twilio", "OpenAI", "Vapi"];

const SocialProofSection = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        <span className="text-xs font-mono tracking-widest uppercase text-primary mb-4 block text-center">
          The Visionaries
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright mb-12 text-center">
          Trusted Infrastructure
        </h2>

        {/* Testimonial */}
        <div className="glass-card rounded-xl p-8 md:p-12 max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed italic mb-6">
            "They didn't just build a bot. They installed a machine that replaced
            15 hours of admin work per week."
          </p>
          <div className="text-sm text-muted-foreground font-mono">
            — Operations Director, Multi-Location SMB
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-ticker">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="shrink-0 mx-12 flex items-center justify-center h-16"
            >
              <span className="text-2xl font-display font-bold text-muted-foreground/40 tracking-wider">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
