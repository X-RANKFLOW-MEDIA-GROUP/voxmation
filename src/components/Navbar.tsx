import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();
  const [lastY, setLastY] = useState(0);

  // Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastY;
    setLastY(latest);
    if (latest < 80) {
      setHidden(false);
      setScrolled(false);
      return;
    }
    setScrolled(true);
    if (diff > 5) setHidden(true);
    if (diff < -5) setHidden(false);
  });

  // Track active section via IntersectionObserver
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: hidden ? -100 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Outer container with padding for floating effect */}
      <div className={`transition-all duration-500 ${scrolled ? "px-4 pt-3" : "px-0 pt-0"}`}>
        <div
          className={`mx-auto transition-all duration-500 ${
            scrolled
              ? "max-w-5xl rounded-2xl glass-card border border-border shadow-lg shadow-background/50"
              : "max-w-full bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-14 px-5">
            {/* Logo */}
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="font-display text-base font-semibold tracking-[0.15em] text-foreground hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              VOXMATION
            </motion.a>

            {/* Desktop nav — pill container */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-0.5 rounded-full border border-border/60 px-1.5 py-1 bg-background/30 backdrop-blur-sm">
                {navLinks.map((l) => {
                  const isActive = activeSection === l.href.replace("#", "");
                  return (
                    <button
                      key={l.href}
                      onClick={() => scrollTo(l.href)}
                      className={`relative text-[13px] px-4 py-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "text-foreground"
                          : "text-silver hover:text-silver-bright"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-accent border border-border/50"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center">
              <Button variant="default" size="sm" className="gap-1.5 text-[13px] h-9" asChild>
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  <Sparkles className="h-3.5 w-3.5" />
                  Book Today
                </a>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden text-foreground p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden mx-4 mt-2 rounded-2xl glass-card border border-border overflow-hidden shadow-xl"
          >
            <div className="px-5 py-4 space-y-1">
              {navLinks.map((l, i) => {
                const isActive = activeSection === l.href.replace("#", "");
                return (
                  <motion.button
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => scrollTo(l.href)}
                    className={`block w-full text-left text-sm py-2.5 px-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-silver hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {l.label}
                  </motion.button>
                );
              })}
            </div>
            <div className="px-5 pb-4">
              <Button variant="default" size="sm" className="w-full gap-1.5" asChild>
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  <Sparkles className="h-3.5 w-3.5" />
                  Book Today
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
