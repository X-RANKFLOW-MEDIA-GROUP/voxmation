import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import FloatingCTA from "@/components/FloatingCTA";
import {
  ArrowUpRight, Play, Phone, MessageSquare, CalendarCheck, UserCheck,
  PhoneOff, Zap, TrendingUp, Clock, ChevronDown, Volume2,
  Flame, Droplets, Wrench, Home, Sparkles, Scale,
  ArrowRight, BarChart3, Users, Bell, CheckCircle2, PhoneCall,
  Workflow, Link2, Bot
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─────────────── DEMO HERO ─────────────── */
const DemoHero = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden noise-overlay">
    <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
    <div className="absolute inset-0 gradient-mesh pointer-events-none" />
    <div className="absolute inset-0 line-grid opacity-[0.03] pointer-events-none" />

    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center pt-28 pb-20">
      {/* Copy */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5"
        >
          <Play className="h-3 w-3 text-primary" />
          <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono">
            Live Demo
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-[1.05] tracking-[-0.02em]"
        >
          <span className="text-silver-bright">See How AI</span>
          <br />
          <span className="text-silver-bright">Turns Missed Calls</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
            Into Booked Jobs.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-silver max-w-lg leading-relaxed"
        >
          Watch Voxmation's AI Voice Agent answer a call, qualify the lead,
          text back missed callers, and book appointments — all in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="neon" size="xl" asChild>
            <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
              Book Your Live Demo
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="neon-outline" size="xl" asChild>
            <a href="#interactive-demo" className="gap-2">
              Explore Below
              <ChevronDown className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Dashboard mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 60, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden lg:block"
      >
        <DashboardMockup />
      </motion.div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
  </section>
);

/* ─────────────── DASHBOARD MOCKUP ─────────────── */
const DashboardMockup = () => (
  <div className="relative">
    <div className="absolute -inset-10 rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-primary/4 blur-3xl" />
    <div className="relative surface-card rounded-2xl border border-border/60 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/80">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground ml-2">Voxmation Dashboard</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Calls Today", value: "47", trend: "+12%" },
            { label: "Jobs Booked", value: "18", trend: "+34%" },
            { label: "Response Time", value: "<1s", trend: "Instant" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-background/60 border border-border/40 p-3">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-mono font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-[9px] font-mono text-warning mt-0.5">{s.trend}</p>
            </div>
          ))}
        </div>

        {/* Recent leads */}
        <div className="rounded-xl bg-background/60 border border-border/40 p-3">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Recent Leads</p>
          {[
            { name: "John M.", type: "HVAC Repair", status: "Booked", time: "2m ago" },
            { name: "Sarah L.", type: "Plumbing Emergency", status: "Following Up", time: "5m ago" },
            { name: "Mike R.", type: "Electrical Quote", status: "Qualified", time: "8m ago" },
          ].map((lead) => (
            <div key={lead.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-3 w-3 text-primary/60" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-foreground">{lead.name}</p>
                  <p className="text-[9px] text-muted-foreground">{lead.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[9px] font-mono ${lead.status === "Booked" ? "text-primary" : lead.status === "Following Up" ? "text-warning" : "text-silver-bright"}`}>
                  {lead.status}
                </p>
                <p className="text-[8px] text-muted-foreground">{lead.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Floating badge */}
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.3, duration: 0.7 }}
      className="absolute -bottom-4 -left-4 glass-card rounded-xl px-5 py-3 shadow-2xl animate-float"
    >
      <p className="text-[9px] text-primary font-mono uppercase tracking-[0.2em] mb-0.5">Live Status</p>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <p className="text-sm font-mono font-bold text-foreground">AI Active</p>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.7 }}
      className="absolute -top-4 -right-4 glass-card rounded-xl px-5 py-3 shadow-2xl animate-float-delayed"
    >
      <p className="text-[9px] text-warning font-mono uppercase tracking-[0.2em] mb-0.5">Today's Revenue</p>
      <p className="text-lg font-mono font-bold text-foreground">$12,450</p>
    </motion.div>
  </div>
);

/* ─────────────── INTERACTIVE DEMO ─────────────── */
const demoTabs = [
  {
    id: "voice",
    icon: Volume2,
    label: "AI Voice Agent",
    title: "Hear Your AI Answer a Call",
    desc: "Your AI picks up in under 1 second, greets the caller by business name, qualifies the service request, checks availability, and books the appointment — all in a natural, human-like voice.",
    steps: [
      { icon: PhoneCall, text: "Customer calls your business number" },
      { icon: Bot, text: "AI answers instantly with your greeting" },
      { icon: UserCheck, text: "Qualifies: service type, urgency, location" },
      { icon: CalendarCheck, text: "Books the appointment into your calendar" },
    ],
  },
  {
    id: "missedcall",
    icon: MessageSquare,
    label: "Missed Call Text Back",
    title: "Every Missed Call Gets a Response",
    desc: "When a call goes unanswered, Voxmation instantly sends a personalized SMS within seconds — keeping the lead warm and driving them to book online or call back.",
    steps: [
      { icon: PhoneOff, text: "Call comes in, no one picks up" },
      { icon: MessageSquare, text: "Instant SMS: 'Sorry we missed you! Book here →'" },
      { icon: UserCheck, text: "Lead clicks link, fills booking form" },
      { icon: CalendarCheck, text: "Job booked — zero manual effort" },
    ],
  },
  {
    id: "crm",
    icon: Link2,
    label: "CRM Automation",
    title: "Your CRM Fills Itself",
    desc: "Every call, text, and booking is automatically logged in your CRM. Lead data, conversation summaries, service requests, and appointment details — all synced in real time.",
    steps: [
      { icon: Phone, text: "AI handles the conversation" },
      { icon: Workflow, text: "Data extracted: name, service, urgency" },
      { icon: Link2, text: "Auto-synced to ServiceTitan, Jobber, or HubSpot" },
      { icon: BarChart3, text: "Pipeline updates in real time" },
    ],
  },
  {
    id: "booking",
    icon: CalendarCheck,
    label: "Booking Workflow",
    title: "Appointments Book Themselves",
    desc: "AI checks your real-time availability, books the appointment, sends confirmation SMS to the customer, and schedules reminders to eliminate no-shows.",
    steps: [
      { icon: CalendarCheck, text: "AI checks your live calendar" },
      { icon: CheckCircle2, text: "Books the best available slot" },
      { icon: MessageSquare, text: "Customer gets instant confirmation" },
      { icon: Bell, text: "Automated reminders reduce no-shows by 89%" },
    ],
  },
];

const InteractiveDemo = () => {
  const [active, setActive] = useState(0);
  const current = demoTabs[active];

  return (
    <section id="interactive-demo" className="py-32 md:py-40 relative noise-overlay">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Interactive Demo
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              See It in Action
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              Explore each feature of the Voxmation system — from the first ring to the booked job.
            </p>
          </Reveal>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {demoTabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActive(i)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-wide transition-all duration-300 ${
                active === i ? "text-primary" : "text-silver hover:text-silver-bright"
              }`}
            >
              {active === i && (
                <motion.span
                  layoutId="demo-tab"
                  className="absolute inset-0 rounded-full bg-primary/8 border border-primary/15"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <tab.icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <div className="surface-card rounded-2xl p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-6">
                    <current.icon className="h-5 w-5 text-primary/70" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 tracking-tight">
                    {current.title}
                  </h3>
                  <p className="text-silver leading-relaxed mb-8">{current.desc}</p>
                  <Button variant="neon" size="lg" asChild>
                    <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                      See a Live Demo
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {/* Flow steps */}
                <div className="space-y-4">
                  {current.steps.map((step, j) => (
                    <motion.div
                      key={step.text}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.1, duration: 0.4 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-background/40 border border-border/40 group hover:border-primary/15 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                        <step.icon className="h-4 w-4 text-primary/60" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-silver-bright font-mono">{step.text}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        Step {j + 1}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ─────────────── INDUSTRY PICKER ─────────────── */
const industries = [
  { id: "hvac", icon: Flame, label: "HVAC", example: "AC repair call at 9 PM → AI answers, qualifies emergency, books next-morning appointment" },
  { id: "plumbing", icon: Droplets, label: "Plumbing", example: "Burst pipe at midnight → AI dispatches emergency, collects info, sends confirmation" },
  { id: "electrical", icon: Zap, label: "Electrical", example: "Panel upgrade request → AI qualifies scope, captures property details, schedules estimate" },
  { id: "roofing", icon: Home, label: "Roofing", example: "Storm damage inquiry → AI handles surge calls, qualifies claims, books inspections" },
  { id: "medspa", icon: Sparkles, label: "Med Spa", example: "Botox appointment request → AI books treatment, sends prep instructions, reduces no-shows" },
  { id: "dental", icon: Sparkles, label: "Dental", example: "New patient intake → AI collects insurance info, schedules cleaning, sends reminders" },
  { id: "legal", icon: Scale, label: "Legal", example: "Personal injury inquiry → AI qualifies case type, collects intake, books consultation" },
];

const IndustryPicker = () => {
  const [active, setActive] = useState(0);

  return (
    <section id="industry-demo" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Your Industry
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Choose Your Business
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              See a real-world example of how Voxmation works for your specific industry.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="max-w-4xl mx-auto">
            {/* Industry grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
              {industries.map((ind, i) => (
                <button
                  key={ind.id}
                  onClick={() => setActive(i)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                    active === i
                      ? "surface-card border-primary/25 bg-primary/5"
                      : "surface-card hover:border-primary/10"
                  }`}
                >
                  <ind.icon className={`h-5 w-5 transition-colors ${active === i ? "text-primary" : "text-silver"}`} />
                  <span className={`text-[10px] font-mono tracking-wider transition-colors ${active === i ? "text-primary" : "text-silver"}`}>
                    {ind.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Example card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={industries[active].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="surface-card rounded-2xl p-8 md:p-12 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = industries[active].icon;
                      return <Icon className="h-5 w-5 text-primary/70" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-3">
                      {industries[active].label} Example
                    </h3>
                    <p className="text-silver-bright leading-relaxed text-lg">
                      {industries[active].example}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─────────────── VOICE AI PLAYER ─────────────── */
const VoicePlayerSection = () => (
  <section className="py-32 md:py-40 relative noise-overlay">
    <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

    <div className="container mx-auto px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              AI Voice Demo
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Hear the AI in Action
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              This is what your customers hear when they call. Natural. Professional. Always on.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} scale>
          <div className="surface-card rounded-2xl p-10 md:p-14 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {/* Waveform visual */}
            <div className="flex items-center justify-center gap-1 mb-8 h-16">
              {[...Array(40)].map((_, i) => {
                const h = Math.sin(i * 0.3) * 30 + Math.random() * 20 + 10;
                return (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-primary/30"
                    initial={{ height: 4 }}
                    animate={{ height: [4, h, 4] }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* Sample transcript */}
            <div className="max-w-md mx-auto text-left space-y-4 mb-10">
              {[
                { speaker: "AI", text: "Thanks for calling Comfort Zone HVAC! How can I help you today?" },
                { speaker: "Caller", text: "Hi, my AC unit stopped working. It's really hot in here." },
                { speaker: "AI", text: "I'm sorry about that! Let me get you scheduled for a repair visit. What's the best time tomorrow morning — 8 AM or 10 AM?" },
                { speaker: "Caller", text: "8 AM works." },
                { speaker: "AI", text: "You're booked for 8 AM tomorrow. I'll send a confirmation text right now. Is there anything else I can help with?" },
              ].map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className={`flex gap-3 ${msg.speaker === "AI" ? "" : "flex-row-reverse"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.speaker === "AI" ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {msg.speaker === "AI" ? (
                      <Bot className="h-3.5 w-3.5 text-primary/70" />
                    ) : (
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`rounded-xl px-4 py-2.5 max-w-[80%] ${
                    msg.speaker === "AI"
                      ? "bg-primary/5 border border-primary/10"
                      : "bg-muted/50 border border-border/50"
                  }`}>
                    <p className="text-sm text-silver-bright leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="neon" size="xl" asChild>
              <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                Hear a Live Demo Call
                <Volume2 className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ─────────────── CALL FLOW VISUALIZATION ─────────────── */
const flowSteps = [
  { icon: Phone, title: "Inbound Call", desc: "Customer dials your number" },
  { icon: Bot, title: "AI Answers (<1s)", desc: "Greets by business name" },
  { icon: UserCheck, title: "Qualifies Lead", desc: "Service type, urgency, location" },
  { icon: CalendarCheck, title: "Books Appointment", desc: "Checks live availability" },
  { icon: MessageSquare, title: "Sends Confirmation", desc: "SMS to customer + your team" },
  { icon: Link2, title: "CRM Updated", desc: "All data synced instantly" },
];

const FlowVisualization = () => (
  <section className="py-32 md:py-40 relative">
    <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-30" />

    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center mb-20">
        <Reveal>
          <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
            The Flow
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
            From Ring to Revenue
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
            Every call follows this automated path. No human intervention required.
          </p>
        </Reveal>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {flowSteps.map((step, i) => (
            <Reveal key={step.title} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -6 }}
                className="surface-card rounded-2xl p-5 text-center relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <span className="text-[10px] font-mono text-muted-foreground mb-3 block">0{i + 1}</span>

                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-3">
                  <step.icon className="h-4 w-4 text-primary/60" />
                </div>

                <h4 className="text-xs font-display font-bold text-foreground mb-1">{step.title}</h4>
                <p className="text-[10px] text-silver leading-relaxed">{step.desc}</p>

                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2.5 z-20">
                    <ArrowRight className="h-3 w-3 text-primary/20" />
                  </div>
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────── BENEFITS ─────────────── */
const benefits = [
  { icon: CalendarCheck, metric: "+40%", title: "More Booked Jobs", desc: "AI fills your calendar while you focus on the work." },
  { icon: Zap, metric: "<1s", title: "Faster Response", desc: "First to respond wins 78% of the time." },
  { icon: PhoneOff, metric: "0", title: "Lost Leads", desc: "Every call, text, and inquiry is captured." },
  { icon: TrendingUp, metric: "10x", title: "Higher ROI", desc: "Costs less than a part-time receptionist." },
];

const DemoBenefits = () => (
  <section className="py-32 md:py-40 relative noise-overlay">
    <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <Reveal>
          <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
            The Results
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
            What Changes When You Go Live
          </h2>
        </Reveal>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {benefits.map((b, i) => (
          <Reveal key={b.title} delay={0.1 * i} scale>
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.4 } }}
              className="surface-card rounded-2xl p-8 text-center relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/30 to-transparent" />

              <p className="text-4xl font-mono font-bold text-warning mb-4 tracking-tight">{b.metric}</p>

              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4">
                <b.icon className="h-5 w-5 text-primary/60" />
              </div>

              <h3 className="text-base font-display font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-silver text-xs leading-relaxed">{b.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────── FINAL CTA ─────────────── */
const FinalCTA = () => (
  <section className="py-24 md:py-32 relative">
    <div className="container mx-auto px-6">
      <Reveal scale>
        <motion.div
          whileHover={{ scale: 1.005, transition: { duration: 0.5 } }}
          className="surface-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 gradient-radial-section opacity-30 group-hover:opacity-50 pointer-events-none transition-opacity duration-700" />
          <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="relative z-10">
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono mb-8 block">
              Ready to See It Live?
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em] max-w-3xl mx-auto leading-[1.1]">
              Book Your Personalized
              <br />
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
                Live Demo Today.
              </span>
            </h2>
            <p className="text-silver text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              We'll show you exactly how Voxmation works for your business, with your industry, your workflows, and your numbers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="neon" size="xl" asChild>
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                  Book Your Live Demo
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="neon-outline" size="xl" asChild>
                <Link to="/" className="gap-2">
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────── DEMO NAVBAR ─────────────── */
const DemoNavbar = () => (
  <motion.nav
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="fixed top-0 left-0 right-0 z-50"
  >
    <div className="px-4 pt-3">
      <div className="mx-auto max-w-5xl rounded-2xl glass-card border border-border/60 shadow-2xl shadow-background/80">
        <div className="flex items-center justify-between h-14 px-5">
          <Link
            to="/"
            className="font-mono text-sm font-bold tracking-[0.2em] text-foreground hover:text-primary transition-colors duration-300"
          >
            VOXMATION
          </Link>

          <div className="hidden md:flex items-center gap-0.5 rounded-full border border-border/40 px-1.5 py-1 bg-background/20 backdrop-blur-sm">
            {[
              { label: "Demo", href: "#interactive-demo" },
              { label: "Industries", href: "#industry-demo" },
              { label: "Flow", href: "#" },
              { label: "Results", href: "#" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs px-4 py-1.5 rounded-full transition-all duration-300 font-mono tracking-wide text-silver hover:text-silver-bright"
              >
                {l.label}
              </a>
            ))}
          </div>

          <Button variant="neon" size="sm" asChild>
            <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
              Book a Demo
            </a>
          </Button>
        </div>
      </div>
    </div>
  </motion.nav>
);

/* ─────────────── FOOTER ─────────────── */
const DemoFooter = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <Link to="/" className="font-mono text-sm font-bold tracking-[0.2em] text-foreground hover:text-primary transition-colors">
        VOXMATION
      </Link>
      <div className="flex gap-8">
        <Link to="/" className="text-xs text-silver hover:text-primary transition-colors font-mono tracking-wide">Home</Link>
        <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="text-xs text-silver hover:text-primary transition-colors font-mono tracking-wide">Book a Demo</a>
      </div>
      <p className="text-xs text-muted-foreground font-mono">© 2026 Voxmation LLC</p>
    </div>
  </footer>
);

/* ─────────────── PAGE ─────────────── */
const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Demo — Voxmation AI Voice Agents for Home Service Businesses</title>
        <meta name="description" content="See how Voxmation's AI Voice Agents answer calls, recover missed leads, and book appointments automatically. Live demo for HVAC, plumbing, electrical, and more." />
        <link rel="canonical" href="https://voxmation.com/demo" />
      </Helmet>
      <DemoNavbar />
      <FloatingCTA />
      <main>
        <DemoHero />
        <InteractiveDemo />
        <IndustryPicker />
        <VoicePlayerSection />
        <FlowVisualization />
        <DemoBenefits />
        <FinalCTA />
      </main>
      <DemoFooter />
    </div>
  );
};

export default Demo;
