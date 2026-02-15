import Reveal from "@/components/Reveal";
import { Star } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-4 w-4 text-silver" />
            <span className="text-xs tracking-[0.2em] uppercase text-silver">
              We Analyze Your Data
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-2xl md:text-3xl font-display font-medium leading-relaxed max-w-3xl text-silver-bright">
            We find what to automate, who your users are & how AI can optimize
            your workflow. Best part is we also build and launch real solutions.
          </h2>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutSection;
