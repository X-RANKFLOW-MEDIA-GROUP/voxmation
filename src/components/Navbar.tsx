import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Problem", href: "#problem" },
    { label: "Solution", href: "#solution" },
    { label: "Method", href: "#methodology" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="font-mono text-xl font-bold tracking-widest text-foreground">
          VOXMATION
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-silver-bright hover:text-primary transition-colors font-mono tracking-wide uppercase"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://portal.voxmation.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-silver-bright hover:text-primary transition-colors font-mono tracking-wide uppercase"
          >
            Client Portal
          </a>
          <Button variant="neon" size="sm" asChild>
            <a href="#pricing">Deploy Your System</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card border-t border-border px-4 pb-6 pt-2 space-y-4">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-silver-bright hover:text-primary font-mono tracking-wide uppercase"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://portal.voxmation.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-silver-bright hover:text-primary font-mono tracking-wide uppercase"
          >
            Client Portal Login
          </a>
          <Button variant="neon" size="sm" className="w-full" asChild>
            <a href="#pricing">Deploy Your System</a>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
