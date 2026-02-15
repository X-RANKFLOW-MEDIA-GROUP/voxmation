import { AlertTriangle, Clock, PhoneOff } from "lucide-react";

const stats = [
  {
    icon: PhoneOff,
    value: "67%",
    label: "of callers hang up on voicemail",
  },
  {
    icon: Clock,
    value: "5 min",
    label: "response delay = 80% drop in conversion",
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4">
        {/* Warning header */}
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-5 w-5 text-warning animate-pulse-neon" />
          <span className="text-xs font-mono tracking-widest uppercase text-warning">
            Revenue Leak Detected
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright mb-12">
          The Revenue Leak
        </h2>

        {/* Stat cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {stats.map((s) => (
            <div
              key={s.value}
              className="glass-card rounded-lg p-8 warning-glow border-warning/20"
            >
              <s.icon className="h-8 w-8 text-warning mb-4" />
              <p className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                {s.value}
              </p>
              <p className="text-muted-foreground text-lg">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Your business is bleeding money in 5-minute increments. You don't need
          more leads.{" "}
          <span className="text-foreground font-medium">
            You need an infrastructure that captures the ones you already have.
          </span>
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
