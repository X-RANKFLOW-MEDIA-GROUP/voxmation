import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const FooterSection = () => {
  return (
    <footer className="border-t border-border relative">
      {/* CTA band */}
      <div className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <Reveal scale>
            <motion.div 
              whileHover={{ scale: 1.005, transition: { duration: 0.5 } }}
              className="surface-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 gradient-radial-section opacity-30 group-hover:opacity-50 pointer-events-none transition-opacity duration-700" />
              <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="relative z-10">
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono mb-8 block">
                  Ready to deploy?
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em] max-w-2xl mx-auto leading-[1.1]">
                  Stop Losing Revenue.
                  <br />
                  <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
                    Start Building Infrastructure.
                  </span>
                </h2>
                <p className="text-silver text-lg mb-12 max-w-md mx-auto leading-relaxed">
                  Book your revenue audit. We'll show you exactly where you're bleeding money.
                </p>
                <Button variant="neon" size="xl" asChild>
                  <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Book Audit
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-sm font-bold tracking-[0.2em] text-foreground">
            VOXMATION
          </span>
          <div className="flex flex-wrap gap-8 justify-center">
            {["Book Audit", "Service Terms", "Privacy Policy"].map((link) => (
              <a key={link} href="#" className="text-xs text-silver hover:text-primary transition-colors duration-300 font-mono tracking-wide">
                {link}
              </a>
            ))}
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
