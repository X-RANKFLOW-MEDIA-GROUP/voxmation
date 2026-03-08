import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Phone, Users, CalendarCheck, DollarSign, Bell, Zap } from "lucide-react";
import dashboardMockup from "@/assets/dashboard-mockup.png";

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

        {/* Dashboard — Real Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)] border border-border"
        >
          <img
            src={dashboardMockup}
            alt="Voxmation CRM dashboard showing 47 calls, 23 leads captured, 12 booked jobs, and $8,400 revenue with live activity feed"
            className="w-full h-auto"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardMockup;
