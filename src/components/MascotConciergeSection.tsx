import Reveal from "@/components/Reveal";
import MascotImage from "@/components/brand/MascotImage";
import { motion } from "framer-motion";
import { CalendarCheck, MessageSquareText, PhoneCall, Workflow } from "lucide-react";

const mascotHighlights = [
  {
    name: "Ashley",
    role: "Front-desk voice AI",
    type: "ashley" as const,
    icon: PhoneCall,
    points: ["Answers every call", "Qualifies new leads", "Handles FAQs naturally"],
  },
  {
    name: "Chris",
    role: "Automation operator",
    type: "chris" as const,
    icon: Workflow,
    points: ["Routes hot opportunities", "Updates your CRM", "Triggers follow-up sequences"],
  },
];

const MascotConciergeSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial-section pointer-events-none opacity-40" />
      <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-warning/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] max-w-6xl mx-auto">
          <Reveal>
            <div>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Meet Your AI Team
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em] leading-[1.05]">
                Ashley and Chris keep your pipeline moving.
              </h2>
              <p className="text-silver text-lg leading-relaxed mb-8 max-w-xl">
                The Voxmation mascots now represent the two sides of your always-on growth system: a friendly AI voice agent for every customer conversation and a reliable automation engine for every follow-up.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: MessageSquareText, label: "Human-like intake", value: "24/7" },
                  { icon: CalendarCheck, label: "Bookings on autopilot", value: "Live" },
                ].map((item) => (
                  <div key={item.label} className="surface-card rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
                    <item.icon className="h-5 w-5 text-primary mb-4 relative z-10" />
                    <div className="text-2xl font-mono font-bold text-warning relative z-10">{item.value}</div>
                    <p className="text-xs text-silver font-mono tracking-wide uppercase mt-1 relative z-10">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {mascotHighlights.map((mascot, index) => (
              <Reveal key={mascot.name} delay={0.12 * index} scale>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-3xl p-6 relative overflow-hidden group min-h-[430px] flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-warning/8 opacity-70 pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-primary font-mono tracking-[0.16em] uppercase">{mascot.role}</p>
                      <h3 className="text-2xl font-display font-bold text-foreground mt-1">{mascot.name}</h3>
                    </div>
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <mascot.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 flex-1 flex items-end justify-center pt-2"
                  >
                    <MascotImage type={mascot.type} size="lg" className="drop-shadow-2xl group-hover:scale-[1.03] transition-transform duration-500" />
                  </motion.div>

                  <div className="relative z-10 mt-5 space-y-2">
                    {mascot.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 text-sm text-silver">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        {point}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MascotConciergeSection;
