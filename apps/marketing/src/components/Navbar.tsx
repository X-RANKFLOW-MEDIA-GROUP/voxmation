"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import clsx from "clsx";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { href: "/industries/hvac-ai-receptionist", label: "HVAC" },
      { href: "/industries/plumbing-ai-receptionist", label: "Plumbing" },
      { href: "/industries/roofing-ai-receptionist", label: "Roofing" },
      { href: "/industries/electrical-ai-receptionist", label: "Electrical" },
      { href: "/industries/cleaning-ai-receptionist", label: "Cleaning" },
      { href: "/industries/landscaping-ai-receptionist", label: "Landscaping" },
      { href: "/industries/medical-spa-ai-receptionist", label: "Med Spa" },
      { href: "/industries/legal-intake-ai-receptionist", label: "Legal" },
    ],
  },
  { href: "/pricing", label: "Pricing" },
];

function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.a ref={ref} href={href} style={{ x, y }}
      onMouseMove={handleMouse} onMouseLeave={reset}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-grad text-[#060A10] font-semibold text-sm glow-orange hover:shadow-orange-glow-lg transition-shadow duration-300 select-none">
      {children}
    </motion.a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setOpen(false); setDropdown(null); }, [pathname]);

  return (
    <motion.header initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={clsx("fixed top-0 inset-x-0 z-50 transition-all duration-400",
        scrolled ? "glass shadow-[0_1px_0_rgba(255,255,255,0.05)]" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="https://2ywrmvccumupilj7.public.blob.vercel-storage.com/logo.png"
            alt="VOXmatiON"
            width={220}
            height={60}
            className="h-16 w-auto object-contain"
            style={{ mixBlendMode: "screen", maxWidth: "260px" }}
            priority
            sizes="260px"
          />
        </Link>

        {/* Center links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="relative" onMouseEnter={() => setDropdown(item.label)} onMouseLeave={() => setDropdown(null)}>
                <Link href={item.href ?? "#"} className="flex items-center gap-1 px-3.5 py-2 text-sm text-[#8A99B3] hover:text-[#F7F5F0] transition-colors duration-200 rounded-lg hover:bg-white/4">
                  {item.label}<ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", dropdown === item.label && "rotate-180")}/>
                </Link>
                <AnimatePresence>
                  {dropdown === item.label && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.4,0,0.2,1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 glass rounded-2xl overflow-hidden py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} className="block px-4 py-2.5 text-sm text-[#8A99B3] hover:text-[#F7F5F0] hover:bg-white/5 transition-colors">{c.label}</Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={item.href} href={item.href!}
                className={clsx("px-3.5 py-2 text-sm rounded-lg transition-colors duration-200",
                  pathname === item.href ? "text-[#F7F5F0] bg-white/8" : "text-[#8A99B3] hover:text-[#F7F5F0] hover:bg-white/4")}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <Link href="/contact" className="text-sm text-[#8A99B3] hover:text-[#F7F5F0] transition-colors">Contact</Link>
          <MagneticButton href="/demo">Get Demo →</MagneticButton>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-[#8A99B3] hover:text-[#F7F5F0] rounded-lg hover:bg-white/8 transition-colors">
          {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="lg:hidden glass border-t border-subtle overflow-hidden">
            <div className="px-5 py-4 space-y-1">
              {NAV.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <p className="px-3 py-2 text-xs font-semibold text-[#FF8A1F] uppercase tracking-widest">{item.label}</p>
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="block pl-6 pr-3 py-2 text-sm text-[#8A99B3] hover:text-[#F7F5F0] rounded-lg hover:bg-white/5 transition-colors">{c.label}</Link>
                    ))}
                  </div>
                ) : (
                  <Link key={item.href} href={item.href!} className="block px-3 py-2.5 text-sm text-[#8A99B3] hover:text-[#F7F5F0] rounded-lg hover:bg-white/5 transition-colors">{item.label}</Link>
                )
              )}
              <div className="pt-3 border-t border-subtle">
                <Link href="/demo" className="flex items-center justify-center py-3.5 rounded-xl bg-orange-grad text-[#060A10] font-semibold text-sm">Get Demo →</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
