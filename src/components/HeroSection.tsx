import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Volume2 } from "lucide-react";
import heroDataflow from "@/assets/hero-dataflow.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 gradient-radial pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-20">
        {/* Left: Copy */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <span className="text-xs tracking-[0.2em] uppercase text-silver-bright">
              Revenue Infrastructure Partner
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.05] tracking-tight"
          >
            Automate
            <br />
            Revenue{" "}
            <span className="italic font-light text-silver-bright">Before</span>
            <br />
            Hiring People.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg text-silver max-w-md leading-relaxed"
          >
            We deploy autonomous Voice AI agents that answer calls, qualify leads,
            and book appointments 24/7. Zero latency. No sick days.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="default" size="xl" asChild>
              <a
                href="https://cal.com/voxmation/meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                Deploy Your System
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="xl">
              <Volume2 className="h-4 w-4 mr-2" />
              Hear Our AI Speak
            </Button>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="flex items-center gap-6 pt-2"
          >
            {["X", "IG", "FB"].map((s) => (
              <a
                key={s}
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-silver hover:text-foreground hover:border-foreground/30 transition-all duration-300"
              >
                <span className="text-xs font-medium">{s}</span>
              </a>
            ))}
          </motion.div>
        </div>

        {/* Right: 3D Data-flow Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative hidden lg:block"
        >
          <div className="relative">
            {/* Glow behind image */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-foreground/5 to-transparent blur-3xl scale-110" />
            <img
              src={heroDataflow}
              alt="3D data-flow visualization showing automation at scale — data particles flowing through interconnected nodes"
              className="relative w-full rounded-2xl border border-border/50 shadow-2xl"
              loading="eager"
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute -bottom-4 -left-4 surface-card rounded-xl px-5 py-3 shadow-xl"
          >
            <p className="text-xs text-silver mb-0.5">Active Agents</p>
            <p className="text-xl font-display font-semibold text-foreground">24/7</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute -top-4 -right-4 surface-card rounded-xl px-5 py-3 shadow-xl"
          >
            <p className="text-xs text-silver mb-0.5">Avg Response</p>
            <p className="text-xl font-display font-semibold text-foreground">&lt;1s</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="lg:hidden relative z-10 w-full px-6 mt-12"
      >
        <img
          src={heroDataflow}
          alt="3D data-flow visualization"
          className="w-full rounded-2xl border border-border/50"
          loading="eager"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-silver" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
