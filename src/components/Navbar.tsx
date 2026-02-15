import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Process", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-card border-b" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="#" className="font-display text-lg font-semibold tracking-wider text-foreground">
          VOXMATION
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-1 rounded-full border border-border px-2 py-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-silver-bright hover:text-foreground transition-colors px-4 py-1.5 rounded-full hover:bg-accent"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="default" size="sm" asChild>
            <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
              Book Today
            </a>
          </Button>
        </div>

        {/* Mobile */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-border px-6 pb-6 pt-4 space-y-3 overflow-hidden"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-silver-bright hover:text-foreground py-2"
              >
                {l.label}
              </a>
            ))}
            <Button variant="default" size="sm" className="w-full" asChild>
              <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                Book Today
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
