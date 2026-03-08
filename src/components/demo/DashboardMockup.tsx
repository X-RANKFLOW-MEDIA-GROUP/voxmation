import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Phone, Users, CalendarCheck, DollarSign, Bell, Zap, Bot } from "lucide-react";

/* ─── ANIMATED COUNTER ─── */
const Counter = ({ target, duration = 2, prefix = "", suffix = "" }: { target: number; duration?: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ─── LIVE NOTIFICATION ─── */
const notifications = [
  { icon: Phone, text: "AI answered call from (214) 555-0342", time: "Just now" },
  { icon: CalendarCheck, text: "Appointment booked — HVAC repair, $280", time: "2m ago" },
  { icon: Zap, text: "Missed call SMS sent → Lead replied", time: "5m ago" },
  { icon: Bell, text: "Lead scored HOT — follow-up #2 sent", time: "8m ago" },
  { icon: DollarSign, text: "Invoice #1047 paid — $340.00", time: "12m ago" },
  { icon: Phone, text: "Outbound call completed — lead qualified", time: "15m ago" },
];

const DashboardMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeNotif, setActiveNotif] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setActiveNotif((prev) => (prev + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [inView]);

  const leads = [
    { name: "Sarah Mitchell", status: "Hot", service: "AC Repair", value: "$340", time: "3m" },
    { name: "James Wilson", status: "Warm", service: "Plumbing", value: "$220", time: "18m" },
    { name: "Emily Rodriguez", status: "Hot", service: "Electrical", value: "$480", time: "34m" },
    { name: "Robert Chen", status: "New", service: "Roofing", value: "$1,200", time: "1h" },
  ];

  return (
    <section ref={ref} className="py-24 sm:py-32 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-muted-foreground mb-4">
            CRM & Dashboard
          </p>
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-foreground mb-3">
            Everything in one place.
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto font-light leading-relaxed">
            Leads, follow-ups, appointments, and revenue — all monitored in real time through your AI dashboard.
          </p>
        </motion.div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.3)]"
        >
          {/* Top bar */}
          <div className="border-b border-border px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
              </div>
              <span className="font-mono text-[0.6rem] text-muted-foreground ml-2 tracking-wider">VOXMATION CRM — LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
              <span className="font-mono text-[0.58rem] text-foreground/50 tracking-wider">LIVE</span>
            </div>
          </div>

          <div className="p-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: Phone, label: "Calls Today", value: 47, prefix: "" },
                { icon: Users, label: "Leads Captured", value: 23, prefix: "" },
                { icon: CalendarCheck, label: "Booked Jobs", value: 12, prefix: "" },
                { icon: DollarSign, label: "Revenue Today", value: 8400, prefix: "$" },
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-background/50 border border-border rounded-xl p-4"
                >
                  <kpi.icon className="w-4 h-4 text-muted-foreground mb-2" />
                  <p className="font-display font-extrabold text-xl text-foreground">
                    <Counter target={kpi.value} prefix={kpi.prefix} />
                  </p>
                  <p className="font-mono text-[0.55rem] text-muted-foreground tracking-wider mt-1">{kpi.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Lead Table */}
              <div className="lg:col-span-2 bg-background/30 border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] text-muted-foreground tracking-wider uppercase">Recent Leads</span>
                  <span className="font-mono text-[0.55rem] text-muted-foreground">{leads.length} active</span>
                </div>
                <div className="divide-y divide-border">
                  {leads.map((lead, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-foreground/[0.04] border border-border flex items-center justify-center text-[0.6rem] font-display font-bold text-foreground/40">
                        {lead.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{lead.name}</p>
                        <p className="text-[0.65rem] text-muted-foreground">{lead.service}</p>
                      </div>
                      <span className="font-mono text-[0.6rem] text-foreground/60 shrink-0">{lead.status}</span>
                      <span className="font-display font-bold text-xs text-foreground shrink-0">{lead.value}</span>
                      <span className="font-mono text-[0.55rem] text-muted-foreground shrink-0">{lead.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Notifications */}
              <div className="bg-background/30 border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <Bell className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[0.6rem] text-muted-foreground tracking-wider uppercase">Live Activity</span>
                </div>
                <div className="p-3 space-y-2">
                  {notifications.map((notif, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: i === activeNotif ? 1 : 0.4,
                        scale: i === activeNotif ? 1 : 0.98,
                      }}
                      transition={{ duration: 0.4 }}
                      className="flex items-start gap-2.5 bg-background/40 border border-border/50 rounded-lg px-3 py-2"
                    >
                      <notif.icon className="w-3.5 h-3.5 text-foreground/40 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.72rem] text-foreground/70 leading-snug">{notif.text}</p>
                        <p className="font-mono text-[0.55rem] text-muted-foreground mt-0.5">{notif.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardMockup;
