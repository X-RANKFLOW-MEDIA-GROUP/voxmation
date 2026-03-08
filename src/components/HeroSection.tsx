import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import TrustBar from "@/components/TrustBar";
import AnimatedCounter from "@/components/AnimatedCounter";

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
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 gradient-radial-hero pointer-events-none" />
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 line-grid opacity-[0.03] pointer-events-none" />

      <motion.div style={{ opacity, scale }} className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
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
              AI Automation for Home Services
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-display font-bold leading-[1.05] tracking-[-0.02em]"
          >
            <span className="text-silver-bright">You're Under the Sink.</span>
            <br />
            <span className="text-silver-bright">Your Phone Is Ringing.</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
              Your AI Answers It.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl text-silver max-w-2xl mx-auto leading-relaxed"
          >
            Voxmation's AI answers every call, follows up with every lead, and books
            appointments 24/7 — so you never lose a job to voicemail again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="neon" size="xl" asChild>
              <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                Start Free 14-Day Trial
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="neon-outline" size="xl" asChild>
              <a href="#how-it-works" className="gap-2">
                See How It Works
                <ChevronDown className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          <TrustBar />
          <AnimatedCounter />
        </div>
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

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default HeroSection;
