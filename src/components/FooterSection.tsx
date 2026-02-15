import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="border-t border-border">
      {/* CTA band */}
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="surface-card rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 gradient-radial-neon opacity-40 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="relative z-10">
                <p className="text-xs tracking-[0.25em] uppercase text-primary font-mono mb-6">
                  Ready to deploy?
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-silver-bright mb-4 tracking-tight max-w-2xl mx-auto leading-tight">
                  Stop Losing Revenue. Start Building Infrastructure.
                </h2>
                <p className="text-silver mb-10 max-w-md mx-auto">
                  Book your revenue audit. We'll show you exactly where you're bleeding money.
                </p>
                <Button variant="neon" size="xl" asChild>
                  <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Book Audit
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-sm font-bold tracking-[0.2em] text-foreground">
            VOXMATION
          </span>
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="#pricing" className="text-xs text-silver hover:text-primary transition-colors font-mono tracking-wide">
              Book Audit
            </a>
            <a href="#" className="text-xs text-silver hover:text-primary transition-colors font-mono tracking-wide">
              Service Terms
            </a>
            <a href="#" className="text-xs text-silver hover:text-primary transition-colors font-mono tracking-wide">
              Privacy Policy
            </a>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            © 2026 Voxmation LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
