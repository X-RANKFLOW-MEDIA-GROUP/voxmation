import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import heroVisual from "@/assets/hero-visual.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background radial glow */}
      <div className="absolute inset-0 gradient-radial-neon opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Copy */}
        <div className="space-y-8 animate-slide-up">
          <div className="inline-block px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-mono tracking-widest uppercase">
            Revenue Infrastructure Partner
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-silver-bright">
            Automate Revenue
            <br />
            <span className="text-primary neon-text">Before Hiring People.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            We deploy autonomous Voice AI agents that answer calls, qualify leads,
            and book appointments 24/7. Zero latency. No sick days.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="neon" size="xl" asChild>
              <a href="#pricing">Deploy Your System</a>
            </Button>
            <Button variant="neon-outline" size="xl">
              <Volume2 className="mr-2 h-5 w-5" />
              Hear Our AI Speak
            </Button>
          </div>
        </div>

        {/* Visual */}
        <div className="relative flex items-center justify-center animate-float">
          <img
            src={heroVisual}
            alt="Autonomous data flow from phone calls to revenue"
            className="w-full max-w-xl rounded-lg opacity-90"
            loading="eager"
          />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
