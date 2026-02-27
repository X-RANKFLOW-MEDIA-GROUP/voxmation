import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Volume2, ChevronDown, Activity, Zap, Shield } from "lucide-react";
import heroDataflow from "@/assets/hero-dataflow.png";
import { useRef } from "react";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
      {/* Ambient background */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 gradient-radial-hero pointer-events-none" />
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 line-grid opacity-[0.03] pointer-events-none" />

      <motion.div style={{ opacity, scale }} className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center pt-28 pb-20">
        {/* Copy */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono">
              Revenue Infrastructure Partner
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-display font-bold leading-[1.02] tracking-[-0.02em]"
          >
            <span className="text-silver-bright">Deploy Your</span>
            <br />
            <span className="text-silver-bright">Autonomous</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
              Revenue Infrastructure.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl text-silver max-w-lg leading-relaxed"
          >
            We deploy autonomous Voice AI agents that answer calls, qualify leads,
            and book appointments 24/7. Zero latency. No sick days.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="neon" size="xl" asChild>
              <a href="#pricing" className="gap-2">
                Deploy Your System
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="neon-outline" size="xl">
              <Volume2 className="h-4 w-4 mr-2" />
              Hear Our AI Speak
            </Button>
          </motion.div>

          {/* Micro stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex items-center gap-8 pt-4"
          >
            {[
              { icon: Activity, label: "99.9% Uptime" },
              { icon: Zap, label: "<1s Response" },
              { icon: Shield, label: "SOC 2 Ready" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-xs text-silver font-mono tracking-wide">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex items-center gap-5 pt-2"
          >
            {[
              { href: "https://x.com/voxmation", label: "X", svg: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              { href: "https://instagram.com/voxmation", label: "Instagram", svg: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> },
              { href: "https://facebook.com/voxmation", label: "Facebook", svg: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-silver hover:text-primary transition-colors duration-300"
                aria-label={social.label}
              >
                {social.svg}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 60, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <div className="relative">
            {/* Background glow */}
            <div className="absolute -inset-10 rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-[hsl(var(--gradient-end))]/5 blur-3xl" />

            <img
              src={heroDataflow}
              alt="3D data-flow visualization — phone to bank, bypassing human figures"
              className="relative w-full rounded-2xl border border-border/60"
              loading="eager"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-background/30 via-transparent to-transparent pointer-events-none" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-6 -left-6 glass-card rounded-xl px-6 py-4 shadow-2xl animate-float"
          >
            <p className="text-[10px] text-primary font-mono uppercase tracking-[0.2em] mb-1">Active Agents</p>
            <p className="text-2xl font-mono font-bold text-foreground">24/7</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -top-6 -right-6 glass-card rounded-xl px-6 py-4 shadow-2xl animate-float-delayed"
          >
            <p className="text-[10px] text-primary font-mono uppercase tracking-[0.2em] mb-1">Response Time</p>
            <p className="text-2xl font-mono font-bold text-foreground">&lt;1s</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile visual */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="lg:hidden relative z-10 w-full px-6 mt-4"
      >
        <img src={heroDataflow} alt="Data flow visualization" className="w-full rounded-2xl border border-border/60" loading="eager" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="h-5 w-5 text-primary/40" />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default HeroSection;
