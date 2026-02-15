import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="surface-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-radial opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs tracking-[0.2em] uppercase text-silver mb-6 italic">
                Reach out anytime
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground mb-6 max-w-2xl mx-auto leading-tight">
                Ready to Automate Smarter? Let's Build Together
              </h2>
              <p className="text-silver mb-10">
                Schedule a Call and Begin Automating
              </p>
              <Button variant="default" size="xl" asChild>
                <a
                  href="https://cal.com/voxmation/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  Book A Free Call
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
