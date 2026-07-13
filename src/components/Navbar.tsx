import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

type NavLink = {
  label: string;
  href: string;
  isRoute?: boolean;
};

const navLinks: NavLink[] = [
  { label: "How It Works", href: "/how-it-works", isRoute: true },
  { label: "Services", href: "/services", isRoute: true },
  { label: "Industries", href: "/industries", isRoute: true },
  { label: "Missed Call Recovery", href: "/missed-call-recovery", isRoute: true },
  { label: "Use Cases", href: "/use-cases", isRoute: true },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Pricing", href: "/pricing", isRoute: true },
  { label: "Demo", href: "/demo", isRoute: true },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();
  const [lastY, setLastY] = useState(0);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastY;
    setLastY(latest);
    if (latest < 80) { setHidden(false); setScrolled(false); return; }
    setScrolled(true);
    if (diff > 5) setHidden(true);
    if (diff < -5) setHidden(false);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollTo = useCallback((href: string, isRoute?: boolean) => {
    setMobileOpen(false);
    if (isRoute) {
      navigate(href);
    } else if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [navigate, location.pathname]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={`transition-all duration-600 ${scrolled ? "px-4 pt-3" : "px-0 pt-0"}`}>
        <div className={`mx-auto transition-all duration-600 ${
          scrolled 
            ? "max-w-5xl rounded-2xl glass-card border border-border/60 shadow-2xl shadow-background/80" 
            : "max-w-full bg-transparent"
        }`}>
          <div className="flex items-center justify-between h-16 px-5">
            <motion.a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center hover:opacity-80 transition-opacity duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src="https://res.cloudinary.com/dyfxkq2nk/image/upload/v1782920036/ChatGPT_Image_Jun_30_2026_08_00_43_PM_bxwxdi.png"
                alt="Voxmation"
                className="h-12 w-auto"
                loading="eager"
                decoding="async"
                width={200}
                height={60}
              />
            </motion.a>

            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-0.5 rounded-full border border-border/40 px-1.5 py-1 bg-background/20 backdrop-blur-sm">
                {navLinks.map((l) => {
                  const isActive = activeSection === l.href.replace("#", "");
                  return (
                    <button
                      key={l.href}
                      onClick={() => scrollTo(l.href, l.isRoute)}
                      className={`relative text-xs px-4 py-1.5 rounded-full transition-all duration-300 font-mono tracking-wide ${
                        isActive ? "text-primary" : "text-silver hover:text-silver-bright"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-primary/8 border border-primary/15"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex lg:hidden items-center gap-3 order-last">
              <Button variant="neon" size="sm" asChild>
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">Demo</a>
              </Button>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="relative" ref={loginDropdownRef}>
                <Button
                  variant="portal"
                  size="sm"
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="flex items-center gap-1"
                >
                  <LogIn className="h-3 w-3" />
                  Login
                  <ChevronDown className={`h-3 w-3 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {loginDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg glass-card border border-border/60 shadow-xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/login");
                            setLoginDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-silver hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <LogIn className="h-4 w-4" />
                          User Login
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/login");
                            setLoginDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-silver hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <LogIn className="h-4 w-4" />
                          Admin Login
                        </button>
                        <div className="border-t border-border/40 my-2" />
                        <button
                          onClick={() => {
                            navigate("/trial/start");
                            setLoginDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-silver hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span>🚀</span>
                          Start Trial
                        </button>
                        <button
                          onClick={() => {
                            navigate("/demo");
                            setLoginDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-silver hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span>📹</span>
                          Demo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button variant="neon" size="sm" asChild>
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">Book a Demo</a>
              </Button>
            </div>

            <motion.button className="lg:hidden text-foreground p-1" onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }}>
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden mx-4 mt-2 rounded-2xl glass-card border border-border overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-4 space-y-1">
              {navLinks.map((l, i) => (
                <motion.button
                  key={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => scrollTo(l.href, l.isRoute)}
                  className="block w-full text-left text-sm py-3 px-4 rounded-xl text-silver hover:text-primary hover:bg-primary/5 transition-all font-mono"
                >
                  {l.label}
                </motion.button>
              ))}
              <div className="border-t border-border/40 my-2" />
              <button onClick={() => { setMobileOpen(false); navigate("/login"); }} className="block w-full text-left text-sm py-3 px-4 text-silver hover:text-primary hover:bg-primary/5 font-mono transition-colors rounded-xl flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                User Login
              </button>
              <button onClick={() => { setMobileOpen(false); navigate("/admin/login"); }} className="block w-full text-left text-sm py-3 px-4 text-silver hover:text-primary hover:bg-primary/5 font-mono transition-colors rounded-xl flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Admin Login
              </button>
              <button onClick={() => { setMobileOpen(false); navigate("/trial/start"); }} className="block w-full text-left text-sm py-3 px-4 text-silver hover:text-primary hover:bg-primary/5 font-mono transition-colors rounded-xl flex items-center gap-2">
                <span>🚀</span>
                Start Trial
              </button>
            </div>
            <div className="px-5 pb-4">
              <Button variant="neon" size="sm" className="w-full" asChild>
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">Book a Demo</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
