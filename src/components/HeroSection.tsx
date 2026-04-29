import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

// Floating sparkle animation
const floatingSparkles = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
};

// Glow pulse animation
const glowPulse = {
  boxShadow: [
    "0 0 20px rgba(var(--color-primary), 0.3)",
    "0 0 40px rgba(var(--color-primary), 0.5)",
    "0 0 20px rgba(var(--color-primary), 0.3)"
  ],
  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
};

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="relative pt-32 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-accent/5 blur-3xl" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-brand-secondary/5 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center relative">
        <div className="flex-1 space-y-5">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 rounded-full bg-bg-subtle px-3 py-1 text-xs font-medium text-brand-secondary group hover:bg-brand-secondary/10 transition-colors duration-300 cursor-pointer"
          >
            <motion.div animate={floatingSparkles}>
              <Sparkles className="h-3.5 w-3.5" />
            </motion.div>
            Voice AI for Sales &amp; Service
          </motion.span>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-3xl font-semibold tracking-tight text-brand-primary md:text-4xl"
          >
            Automate calls and leads
            <br />
            <motion.span
              className="bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent bg-size-200 bg-pos-0 text-transparent bg-clip-text"
              animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              with AI voice agents that close deals.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="max-w-xl text-sm text-text-secondary md:text-base"
          >
            Voxmation connects your CRM, calendar, and billing stack to
            run voice campaigns, qualification, and follow-up — no extra headcount.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap items-center gap-3"
          >
            <motion.button
              onClick={() => setDialogOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              animate={glowPulse}
              className="rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-text-inverse shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ opacity: 0.3 }}
              />
              <span className="relative">Book a Free Demo</span>
            </motion.button>
            <motion.a
              href="#how-it-works"
              whileHover={{ x: 5 }}
              className="text-sm font-semibold text-brand-secondary hover:text-brand-accent transition-colors flex items-center gap-1"
            >
              See how it works
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="text-xs text-text-secondary/80"
          >
            On average, teams cut manual follow-up time by 40%.
          </motion.p>
        </div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="flex-1"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl bg-bg-surface p-5 shadow-xl ring-1 ring-border-subtle hover:ring-brand-secondary/20 transition-all duration-300 group"
          >
            <motion.div
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-3 text-xs font-semibold text-brand-secondary flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-brand-accent"
              />
              Real-Time Dashboard
            </motion.div>
            <div className="space-y-2 rounded-xl bg-bg-body p-4">
              {[
                { label: "Calls today", value: "328", color: "text-brand-primary" },
                { label: "Qualified leads", value: "74", color: "text-brand-accent" },
                { label: "Avg. duration", value: "1m 42s", color: "text-brand-secondary" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between text-xs text-text-secondary group/stat hover:text-text-primary transition-colors"
                >
                  <span>{stat.label}</span>
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    className={`font-semibold ${stat.color}`}
                  >
                    {stat.value}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} pageSource="hero" />
    </section>
  );
};

export default HeroSection;
