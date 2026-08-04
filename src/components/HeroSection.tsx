import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  PhoneCall,
  Play,
  Sparkles,
  UserCheck,
} from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const proofPoints = [
  {
    icon: PhoneCall,
    title: "24/7 Call Answering",
    description: "Every caller gets an immediate response.",
  },
  {
    icon: UserCheck,
    title: "Lead Qualification",
    description: "Intent, urgency, and fit are captured automatically.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booking",
    description: "Qualified leads move directly into your calendar.",
  },
];

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#071225] px-4 pb-16 pt-28 text-[#F8FAFC] sm:px-6 md:pb-20 md:pt-36 lg:min-h-[760px] lg:flex lg:items-center">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#071225_0%,#0B1730_55%,#08101F_100%)]" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#F97316]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-24 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#FDBA74]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI voice agents that work 24/7
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="max-w-3xl text-[46px] font-bold leading-[0.98] tracking-[-0.045em] text-[#F8FAFC] sm:text-6xl md:text-7xl lg:text-[72px]"
          >
            Never Miss Another
            <span className="mt-2 block text-[#F97316]">Qualified Call.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-7 max-w-2xl text-base leading-7 text-[#CBD5E1] sm:text-lg sm:leading-8"
          >
            Voxmation answers, qualifies, and books leads 24/7, helping your business capture more revenue without adding headcount.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-7 text-base font-bold text-white shadow-[0_18px_45px_rgba(249,115,22,0.24)] transition hover:bg-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:ring-offset-2 focus:ring-offset-[#071225]"
            >
              Book a Demo
              <ArrowRight className="h-5 w-5" />
            </button>

            <a
              href="#how-it-works"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-7 text-base font-bold text-[#F8FAFC] transition hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#071225]"
            >
              <Play className="h-4 w-4 fill-current" />
              See How It Works
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            {proofPoints.map((point) => (
              <div key={point.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#E2E8F0]">
                  <point.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F8FAFC]">{point.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{point.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 34, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-5 rounded-[36px] bg-[#F97316]/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,23,48,0.94),rgba(7,18,37,0.98))] p-4 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">AI agent in action</p>
                <p className="mt-1 text-base font-bold text-[#F8FAFC]">Inbound lead workflow</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-3 py-1.5 text-xs font-semibold text-[#86EFAC]">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                Live
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F97316]/15 text-[#FB923C]">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-bold text-[#F8FAFC]">New service call</p>
                    <span className="shrink-0 text-xs text-[#94A3B8]">Connected</span>
                  </div>
                  <p className="mt-1 text-sm text-[#CBD5E1]">AI agent is understanding the customer&apos;s request.</p>
                </div>
              </div>

              <div className="mt-5 flex h-14 items-end gap-1 rounded-xl bg-[#071225]/80 px-4 py-3" aria-label="Live call waveform">
                {[18, 31, 22, 42, 28, 48, 35, 23, 44, 30, 50, 26, 38, 20, 34, 46, 24, 39, 29, 43].map((height, index) => (
                  <motion.span
                    key={`${height}-${index}`}
                    className="w-full rounded-full bg-[#FB923C]"
                    animate={{ height: [`${Math.max(12, height - 9)}%`, `${height}%`, `${Math.max(14, height - 5)}%`] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.035 }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { icon: CheckCircle2, title: "Call answered", detail: "Immediate 24/7 response", complete: true },
                { icon: UserCheck, title: "Lead qualified", detail: "Need, location, and urgency captured", complete: true },
                { icon: CalendarCheck, title: "Appointment booking", detail: "Calendar availability confirmed", complete: false },
              ].map((step) => (
                <div key={step.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.complete ? "bg-[#22C55E]/10 text-[#4ADE80]" : "bg-[#F97316]/12 text-[#FB923C]"}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#F8FAFC]">{step.title}</p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">{step.detail}</p>
                  </div>
                  {step.complete ? (
                    <span className="text-xs font-semibold text-[#4ADE80]">Complete</span>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#FDBA74]">
                      <Activity className="h-4 w-4" />
                      In progress
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} pageSource="hero" />
    </section>
  );
};

export default HeroSection;
