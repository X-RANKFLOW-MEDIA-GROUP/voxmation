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

const ServicesSection = () => {
  return (
    <section id="services" className="py-32 md:py-40 relative noise-overlay">
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
                whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-6 group-hover:bg-primary/12 group-hover:border-primary/25 transition-all duration-500">
                  <s.icon className="h-5 w-5 text-primary/70" />
                </div>

                <h3 className="text-lg font-display font-bold text-foreground mb-3 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
