import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { VOXMATION_PHONE, VOXMATION_PHONE_TEL, VOXMATION_SUPPORT_EMAIL, VOXMATION_SUPPORT_MAILTO } from "@/lib/contact";

const FooterSection = () => {
  return (
    <footer className="border-t border-border relative">
      {/* Final CTA band */}
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
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8 flex justify-center"
                >
                  <MascotImage type="both" size="lg" className="w-44 md:w-56 drop-shadow-2xl" />
                </motion.div>
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono mb-8 block">
                  Ready to Grow?
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em] max-w-3xl mx-auto leading-[1.1]">
                  Stop Losing Calls.
                  <br />
                  <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
                    Start Booking More Jobs.
                  </span>
                </h2>
                <p className="text-silver text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                  Book a free demo and see exactly how Voxmation can recover lost revenue and fill your calendar on autopilot.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="neon" size="xl" asChild>
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                      Book a Free Demo
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="neon-outline" size="xl" asChild>
                    <a href={VOXMATION_PHONE_TEL} className="gap-2">
                      <Phone className="h-4 w-4" />
                      Call {VOXMATION_PHONE}
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-border py-10">
        <div className="container mx-auto px-6">
          <div className="surface-card rounded-2xl p-6 max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-display font-bold text-silver-bright mb-4">Get in Touch</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-mono">
              <a href={VOXMATION_PHONE_TEL} className="inline-flex items-center gap-2 text-primary hover:underline">
                <Phone className="h-4 w-4" />
                Phone: {VOXMATION_PHONE} (24/7)
              </a>
              <a href={VOXMATION_SUPPORT_MAILTO} className="inline-flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" />
                Email: {VOXMATION_SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-mono text-sm font-bold tracking-[0.2em] text-foreground">
            VOXMATION
          </span>
          <div className="flex flex-wrap gap-8 justify-center">
            {[
              { label: "Pricing", to: "/pricing" },
              { label: "ROI Calculator", to: "/roi-calculator" },
              { label: "Demo", to: "/demo" },
              { label: "Contact", to: "/contact" },
              { label: "Book a Call", href: "https://cal.com/voxmation/meeting" },
            ].map((link) => (
              'to' in link ? (
                <Link key={link.label} to={link.to!} className="text-xs text-silver hover:text-primary transition-colors duration-300 font-mono tracking-wide">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs text-silver hover:text-primary transition-colors duration-300 font-mono tracking-wide">
                  {link.label}
                </a>
              )
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
            © 2026 Voxmation LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
