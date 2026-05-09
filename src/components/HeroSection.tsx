import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Sparkles } from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import MascotImage from "@/components/brand/MascotImage";
import { VOXMATION_PHONE, VOXMATION_PHONE_TEL } from "@/lib/contact";

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
            AI Voice Agents for Home Service Businesses
            <br />
            <motion.span
              className="bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent bg-size-200 bg-pos-0 text-transparent bg-clip-text"
              animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              that answer, qualify, and book jobs.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="max-w-xl text-sm text-text-secondary md:text-base"
          >
            Answer every call. Follow up every lead. Book appointments 24/7 with AI voice agents connected to your CRM, calendar, and billing stack.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap items-center gap-3"
          >
            <motion.a
              href={VOXMATION_PHONE_TEL}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              animate={glowPulse}
              className="rounded-full bg-warning px-5 py-2.5 text-sm font-semibold text-background shadow-lg hover:shadow-xl transition-all relative overflow-hidden group flex items-center gap-2"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ opacity: 0.3 }}
              />
              <Phone className="relative h-4 w-4" />
              <span className="relative">Call Now: {VOXMATION_PHONE}</span>
            </motion.a>
            <motion.button
              onClick={() => setDialogOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-text-inverse shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <span className="relative">Book a Free Demo</span>
            </motion.button>
            <motion.a
              href="#pricing"
              whileHover={{ x: 5 }}
              className="text-sm font-semibold text-brand-secondary hover:text-brand-accent transition-colors flex items-center gap-1"
            >
              View Pricing
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
            No contracts. Setup in 24–48 hours. Call 844-687-7999 for help any time.
          </motion.p>
        </div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="flex-1"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl bg-bg-surface p-5 shadow-xl ring-1 ring-border-subtle hover:ring-brand-secondary/20 transition-all duration-300 group relative overflow-hidden"
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
            <div className="space-y-2 rounded-xl bg-bg-body p-4 relative z-10">
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

            <div className="mt-4 grid gap-4 rounded-2xl border border-brand-secondary/10 bg-gradient-to-br from-bg-body to-bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-end relative z-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-secondary">Meet Ashley &amp; Chris</p>
                <p className="mt-2 text-sm font-medium text-brand-primary">Your AI voice agent and automation operator work every lead together.</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-text-secondary">
                  <span className="rounded-full bg-brand-accent/10 px-2.5 py-1 text-brand-accent">Answers calls</span>
                  <span className="rounded-full bg-brand-secondary/10 px-2.5 py-1 text-brand-secondary">Books jobs</span>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto -mb-2 sm:-mr-2"
              >
                <MascotImage type="both" size="md" priority lazy={false} className="w-36 sm:w-44" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} pageSource="hero" />
    </section>
  );
};

export default HeroSection;
