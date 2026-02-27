import Reveal from "@/components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does it take to deploy?",
    a: "Most clients are live within 7–14 days. We handle everything from CRM integration to AI training, so you don't have to lift a finger.",
  },
  {
    q: "Will the AI sound robotic?",
    a: "Not at all. Our voice agents use advanced synthesis technology that produces natural, human-like conversation. Most callers don't realize they're speaking with AI.",
  },
  {
    q: "Do you integrate with my existing CRM?",
    a: "Yes. We support HubSpot, Zoho, Salesforce, GoHighLevel, and most major CRMs. Our team handles the entire integration during onboarding.",
  },
  {
    q: "What happens if the AI can't handle a call?",
    a: "Smart escalation is built in. If a conversation goes beyond the AI's scope, it seamlessly transfers to a human agent with full context of the conversation.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No. We operate on monthly agreements because we believe our results speak for themselves. You stay because the ROI is undeniable, not because of a contract.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 md:py-40 relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Questions
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Frequently Asked
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="surface-card rounded-2xl border border-border px-6 hover:border-primary/15 transition-colors duration-500 data-[state=open]:border-primary/20"
                >
                  <AccordionTrigger className="text-sm font-display font-semibold text-foreground hover:no-underline py-5 tracking-tight">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-silver text-sm leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FAQSection;
