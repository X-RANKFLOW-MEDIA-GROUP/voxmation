import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import heroVisual from "@/assets/hero-visual.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroVisual}
          alt=""
          className="w-full h-full object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Soft radial glow */}
      <div className="absolute inset-0 gradient-radial pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          <span className="text-xs tracking-[0.2em] uppercase text-silver-bright">
            New Gen AI Automation Partner
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.1] tracking-tight"
        >
          Automate Smarter.
          <br />
          Grow Faster.{" "}
          <span className="italic font-light text-silver-bright">With Voxmation.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-lg text-silver max-w-xl mx-auto"
        >
          AI Automation for Modern Businesses Made Simple
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <Button variant="default" size="xl" asChild>
            <a
              href="https://cal.com/voxmation/meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              Book A Free Call
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>

        {/* Social icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="flex items-center justify-center gap-6 pt-4"
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

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
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
