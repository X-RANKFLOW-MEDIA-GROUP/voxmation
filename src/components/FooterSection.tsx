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
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
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
          <div className="flex items-center gap-5">
            {[
              { href: "https://x.com/voxmation", label: "X", svg: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              { href: "https://instagram.com/voxmation", label: "Instagram", svg: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> },
              { href: "https://facebook.com/voxmation", label: "Facebook", svg: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            ].map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-silver hover:text-primary transition-colors duration-300" aria-label={social.label}>
                {social.svg}
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
