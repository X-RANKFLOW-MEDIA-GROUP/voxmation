import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { PhoneOff, MessageSquare, Reply, CalendarCheck, ArrowRight } from "lucide-react";

const timelineSteps = [
  {
    icon: PhoneOff,
    title: "Missed Call",
    desc: "Customer calls at 9:47 PM. No one picks up.",
    time: "9:47 PM",
    color: "text-foreground",
  },
  {
    icon: MessageSquare,
    title: "Auto SMS Sent",
    desc: "AI sends personalized text within 30 seconds.",
    time: "9:47 PM",
    color: "text-foreground",
  },
  {
    icon: Reply,
    title: "Lead Replies",
    desc: '"Yes, I need my AC fixed ASAP."',
    time: "9:49 PM",
    color: "text-foreground",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booked",
    desc: "AI books next available slot automatically.",
    time: "9:50 PM",
    color: "text-foreground",
  },
];

const phoneChatMessages = [
  { type: "system", text: "Missed call from (214) 555-0187" },
  { type: "out", text: "Hi! This is Comfort Zone HVAC. Sorry we missed your call. How can we help? Reply here or we'll call you back!" },
  { type: "in", text: "Yes! My AC stopped working. Can someone come tomorrow?" },
  { type: "out", text: "Absolutely! I have a technician available tomorrow at 10 AM. Should I book it?" },
  { type: "in", text: "Yes please! 🙏" },
  { type: "out", text: "Done! ✅ You're booked for tomorrow at 10 AM. You'll get a reminder. Have a great night!" },
];

const MissedCallDemo = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    // Animate timeline steps
    const stepTimers = timelineSteps.map((_, i) =>
      setTimeout(() => setActiveStep(i), 800 + i * 1200)
    );
    // Animate phone messages
    const msgTimers = phoneChatMessages.map((_, i) =>
      setTimeout(() => setVisibleMessages(i + 1), 1500 + i * 1000)
    );
    return () => {
      stepTimers.forEach(clearTimeout);
      msgTimers.forEach(clearTimeout);
    };
  }, [inView]);

  return (
    <section ref={ref} className="py-24 sm:py-32 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-muted-foreground mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-foreground/15" />
            Missed Call Recovery
          </p>
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-foreground mb-3 max-w-lg">
            Nenhuma chamada perdida vira lead perdido.
          </h2>
          <p className="text-muted-foreground text-base max-w-md font-light leading-relaxed">
            Quando você não atende, a Voxmation responde em 30 segundos via SMS — e converte em agendamento automaticamente.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — Timeline */}
          <div className="space-y-0">
            {timelineSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView && activeStep >= i ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-4 relative"
              >
                {/* Vertical line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-500 ${
                    activeStep >= i
                      ? "border-foreground/25 bg-foreground/[0.06]"
                      : "border-border bg-card"
                  }`}>
                    <step.icon className={`w-4 h-4 transition-colors duration-500 ${
                      activeStep >= i ? "text-foreground" : "text-muted-foreground/40"
                    }`} />
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`w-px h-16 transition-colors duration-500 ${
                      activeStep > i ? "bg-foreground/15" : "bg-border"
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1.5 pb-8">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-foreground text-sm">{step.title}</h3>
                    <span className="font-mono text-[0.58rem] text-muted-foreground">{step.time}</span>
                  </div>
                  <p className="text-muted-foreground text-[0.85rem] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right — Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-[300px] bg-card border border-border rounded-[28px] p-1.5 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
              <div className="bg-background rounded-[22px] overflow-hidden">
                {/* Phone status bar */}
                <div className="px-5 pt-3 pb-2 flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] text-muted-foreground">9:47 PM</span>
                  <div className="w-20 h-5 bg-foreground/10 rounded-full" />
                  <div className="flex gap-1">
                    <span className="w-3 h-3 bg-foreground/10 rounded-full" />
                    <span className="w-3 h-3 bg-foreground/10 rounded-full" />
                  </div>
                </div>

                {/* Chat header */}
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center text-sm">🤖</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Comfort Zone HVAC</p>
                    <p className="text-[0.6rem] text-muted-foreground font-mono">Voxmation AI</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="px-3 py-3 min-h-[320px] flex flex-col gap-2">
                  {phoneChatMessages.slice(0, visibleMessages).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`${msg.type === "system" ? "self-center" : msg.type === "out" ? "self-start" : "self-end"}`}
                    >
                      {msg.type === "system" ? (
                        <span className="font-mono text-[0.6rem] text-muted-foreground bg-foreground/[0.03] border border-border px-3 py-1 rounded-full">
                          {msg.text}
                        </span>
                      ) : (
                        <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[0.78rem] leading-snug ${
                          msg.type === "out"
                            ? "bg-card border border-border rounded-bl-sm text-foreground/80"
                            : "bg-foreground text-background rounded-br-sm"
                        }`}>
                          {msg.text}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-12 flex items-center justify-center gap-2 text-muted-foreground text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="font-mono text-[0.72rem] tracking-wider">
            Total time: <span className="text-foreground font-semibold">3 minutes</span> from missed call to booked job
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default MissedCallDemo;
