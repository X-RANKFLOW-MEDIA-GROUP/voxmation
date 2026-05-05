import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Phone, Workflow, Link2, MessageSquare, UserCheck, CalendarCheck } from "lucide-react";

const services = [
  {
    icon: Phone,
    title: "AI Voice Agents",
    desc: "Your AI receptionist answers every call 24/7 — qualifies leads, handles objections, and books appointments with a natural, human-like voice.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    desc: "End-to-end automation connecting your website, phone, and CRM. Leads are captured, scored, and routed without a single manual step.",
  },
  {
    icon: Link2,
    title: "CRM Integration",
    desc: "Seamless sync with HubSpot, GoHighLevel, Jobber, ServiceTitan, Housecall Pro, and more. Every lead is logged automatically.",
  },
  {
    icon: MessageSquare,
    title: "Missed Call Text Back",
    desc: "Every missed call triggers an instant SMS response within seconds — keeping the lead warm and driving them to book online.",
  },
  {
    icon: UserCheck,
    title: "Lead Follow-Up",
    desc: "Automated multi-touch follow-up sequences via SMS, email, and voicemail drops. No lead falls through the cracks ever again.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booking",
    desc: "AI-powered scheduling that books directly into your calendar. Sends confirmations, reminders, and reduces no-shows by up to 89%.",
  },
];

// Shimmer animation effect
const shimmerAnimation = (delay: number) => ({
  backgroundPosition: ["0% 0%", "100% 100%"],
  transition: { duration: 3, delay, repeat: Infinity, ease: "easeInOut" }
});

// Icon bounce animation
const bounceAnimation = (delay: number) => ({
  y: [0, -6, 0],
  transition: { duration: 2.5, delay, repeat: Infinity, ease: "easeInOut" }
});

const ServicesSection = () => {
  return (
    <section id="services" className="py-32 md:py-40 relative noise-overlay overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Core Services
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
                Never Miss Revenue Again
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              A complete AI-powered system built for home service businesses that want to capture every lead and book more jobs.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={0.08 * i} scale>
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                {/* Animated top border glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Enhanced background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Premium icon container with enhanced styling */}
                <motion.div
                  animate={bounceAnimation(i * 0.15)}
                  className="mb-6 relative"
                >
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/15 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110" />

                  <motion.div
                    animate={{ rotate: [0, -2, 2, 0] }}
                    transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/25 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 group-hover:border-primary/40 transition-all duration-500 relative z-10 shadow-lg"
                  >
                    <s.icon className="h-6 w-6 text-primary/80 group-hover:text-primary/100 transition-colors duration-500" />
                  </motion.div>
                </motion.div>

                <h3 className="text-lg font-display font-bold text-foreground mb-3 tracking-tight relative z-10">
                  {s.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed relative z-10">{s.desc}</p>

                {/* Shimmer effect on hover */}
                <motion.div
                  animate={shimmerAnimation(i * 0.1)}
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
