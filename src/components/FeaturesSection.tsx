import Reveal from "@/components/Reveal";
import {
  Workflow,
  Brain,
  Bot,
  Megaphone,
  Activity,
  Link2,
} from "lucide-react";

const features = [
  { icon: Workflow, title: "Workflow Automation", desc: "Automate complex business processes to boost speed, clarity, and efficiency." },
  { icon: Brain, title: "Custom AI Solutions", desc: "Build tailored AI systems that align with your business goals and challenges." },
  { icon: Bot, title: "AI Assistant", desc: "Deploy intelligent virtual agents to streamline tasks." },
  { icon: Megaphone, title: "Sales & Marketing", desc: "Leverage AI to optimize campaigns, track leads, and personalize outreach." },
  { icon: Activity, title: "Performance Tracking", desc: "Track automation results in real time to improve and scale your workflows." },
  { icon: Link2, title: "Seamless Integrations", desc: "Connect your tools and apps for smooth, unified AI-powered workflows." },
];

const FeaturesSection = () => {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.2em] uppercase text-silver block mb-4">
            Features
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4">
            All features in one place
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver mb-16 max-w-lg">
            Everything you need to automate operations, boost productivity
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={0.05 * i}>
              <div className="surface-card rounded-2xl p-7 group hover:bg-accent/50 transition-all duration-500 h-full">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <f.icon className="h-4 w-4 text-silver-bright" />
                </div>
                <h3 className="text-base font-display font-medium text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-silver text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
