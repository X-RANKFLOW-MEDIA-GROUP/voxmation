import Reveal from "@/components/Reveal";

const integrations = [
  "ServiceTitan", "Zoho CRM", "HubSpot", "Google Calendar",
  "Jobber", "Housecall Pro", "GoHighLevel", "Calendly",
];

const IntegrationLogos = () => (
  <section className="py-16 relative overflow-hidden">
    <div className="container mx-auto px-6">
      <Reveal>
        <p className="text-center text-xs font-mono text-silver tracking-[0.15em] uppercase mb-8">
          Integrates with your favorite tools
        </p>
      </Reveal>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-ticker">
          {[...Array(4)].flatMap((_, setIdx) =>
            integrations.map((name, i) => (
              <div key={`${setIdx}-${i}`} className="shrink-0 mx-12 flex items-center justify-center h-12">
                <span className="text-sm font-mono font-bold text-muted-foreground/20 tracking-[0.12em] whitespace-nowrap uppercase hover:text-muted-foreground/40 transition-colors duration-500">
                  {name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </section>
);

export default IntegrationLogos;
