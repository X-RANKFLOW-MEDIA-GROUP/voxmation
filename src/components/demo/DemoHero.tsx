import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Phone, MessageSquare, Calendar, BarChart3, Mic, Bot, Zap, Activity } from "lucide-react";

const DemoHero = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative py-28 sm:py-36 px-5 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,hsl(0_0%_100%/0.03),transparent)] blur-2xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-muted-foreground mb-5 flex items-center gap-3">
              <Activity className="w-3 h-3" />
              Interactive Demo
            </p>

            <h1 className="font-display font-extrabold text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] tracking-[-0.045em] text-foreground mb-5">
              See how calls become{" "}
              <span className="bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">
                revenue.
              </span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-lg font-light">
              AI Voice Agents, missed call recovery, CRM automation, and appointment booking — all working together, 24/7, with zero human effort.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#voice-demo"
                className="bg-foreground text-background font-display font-bold rounded-xl py-3.5 px-7 text-sm flex items-center gap-2.5 shadow-[0_0_40px_hsl(0_0%_100%/0.08)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_hsl(0_0%_100%/0.12)] transition-all"
              >
                <Mic className="w-4 h-4" />
                Hear the AI Agent
              </a>
              <a
                href="https://cal.com/voxmation/meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-border text-foreground/70 font-display font-semibold rounded-xl py-3.5 px-7 text-sm flex items-center gap-2 hover:border-foreground/15 hover:text-foreground transition-all"
              >
                Schedule a Demo
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Right — System Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

              {/* Top bar */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                </div>
                <span className="font-mono text-[0.6rem] text-muted-foreground ml-3 tracking-wider">VOXMATION DASHBOARD</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { icon: Phone, label: "Calls Today", value: "47" },
                  { icon: MessageSquare, label: "Auto SMS", value: "23" },
                  { icon: Calendar, label: "Booked", value: "12" },
                  { icon: BarChart3, label: "Revenue", value: "$8.4K" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="bg-background/50 border border-border rounded-lg p-3"
                  >
                    <s.icon className="w-3.5 h-3.5 text-muted-foreground mb-1.5" />
                    <p className="font-display font-bold text-foreground text-sm">{s.value}</p>
                    <p className="font-mono text-[0.55rem] text-muted-foreground tracking-wider">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Activity feed */}
              <div className="space-y-2">
                {[
                  { time: "2m ago", text: "AI booked HVAC repair — $340", accent: true },
                  { time: "8m ago", text: "Missed call → SMS sent → Lead replied" },
                  { time: "14m ago", text: "Follow-up #3 → Appointment confirmed", accent: true },
                  { time: "22m ago", text: "New lead qualified — Score: Hot" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.8 + i * 0.12 }}
                    className="flex items-center gap-3 bg-background/30 border border-border/50 rounded-lg px-3 py-2"
                  >
                    <Zap className={`w-3 h-3 shrink-0 ${item.accent ? "text-foreground/60" : "text-foreground/20"}`} />
                    <span className="text-[0.78rem] text-foreground/70 flex-1">{item.text}</span>
                    <span className="font-mono text-[0.6rem] text-muted-foreground shrink-0">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoHero;
