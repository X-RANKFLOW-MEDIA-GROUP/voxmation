import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { PhoneOff, MessageSquare, Reply, CalendarCheck, ArrowRight } from "lucide-react";
import phoneMockup from "@/assets/phone-mockup.png";

const timelineSteps = [
  {
    icon: PhoneOff,
    title: "Missed Call",
    desc: "Customer calls at 9:47 PM. Nobody picks up.",
    time: "9:47 PM",
  },
  {
    icon: MessageSquare,
    title: "Auto SMS Sent",
    desc: "AI sends a personalized text within 30 seconds.",
    time: "9:47 PM",
  },
  {
    icon: Reply,
    title: "Lead Replies",
    desc: '"Yes, I need my AC fixed ASAP."',
    time: "9:49 PM",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booked",
    desc: "AI books the next available slot automatically.",
    time: "9:50 PM",
  },
];

const phoneChatMessages = [
  { type: "system", text: "Missed call from (214) 555-0187" },
  { type: "out", text: "Hi! This is Comfort Zone HVAC. Sorry we missed your call. How can we help? Reply here or we'll call you back!" },
  { type: "in", text: "Yes! My AC stopped working. Can someone come tomorrow?" },
  { type: "out", text: "Absolutely! I have a technician available tomorrow at 10 AM. Should I book it?" },
  { type: "in", text: "Yes please!" },
  { type: "out", text: "Done! You're booked for tomorrow at 10 AM. You'll get a reminder. Have a great night!" },
];

const MissedCallDemo = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    const stepTimers = timelineSteps.map((_, i) =>
      setTimeout(() => setActiveStep(i), 800 + i * 1200)
    );
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
            <PhoneOff className="w-3 h-3" />
            Missed Call Recovery
          </p>
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-foreground mb-3 max-w-lg">
            No missed call ever becomes a lost lead.
          </h2>
          <p className="text-muted-foreground text-base max-w-md font-light leading-relaxed">
            When you don't answer, Voxmation responds within 30 seconds via SMS — and converts it into a booked appointment automatically.
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

          {/* Right — Phone Mockup (Real Image) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-[320px] rounded-[32px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-border">
              <img
                src={phoneMockup}
                alt="iPhone showing automated SMS conversation between Voxmation AI and a customer requesting HVAC service"
                className="w-full h-auto"
                loading="lazy"
              />
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
