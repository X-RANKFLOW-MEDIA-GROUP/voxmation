import Reveal from "@/components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does setup take?",
    a: "Most businesses are live within 7–14 days. We handle everything — CRM integration, AI training, workflow setup, and testing. You don't have to lift a finger.",
  },
  {
    q: "Will the AI sound robotic to my customers?",
    a: "Not at all. Our voice agents use advanced synthesis that sounds natural and professional. Most callers don't realize they're speaking with AI. We customize the voice, tone, and script for your brand.",
  },
  {
    q: "Does it work with my existing CRM and tools?",
    a: "Yes. We integrate with ServiceTitan, Jobber, Housecall Pro, GoHighLevel, HubSpot, Zoho, and most major CRMs and scheduling tools. Our team handles the entire setup.",
  },
  {
    q: "What happens if the AI can't handle a call?",
    a: "Smart escalation is built in. If a conversation exceeds the AI's scope, it seamlessly transfers to your team with full context — so nothing is lost.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No. We operate month-to-month because we believe our results speak for themselves. You stay because the ROI is undeniable, not because of a contract.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on your call volume and the services you need. Most home service businesses pay less than the cost of a part-time receptionist. Book a demo and we'll give you a custom quote.",
  },
  {
    q: "Will this work for my specific type of business?",
    a: "If your business takes inbound calls, books appointments, or follows up with leads — yes. We've built systems for HVAC, plumbing, electrical, roofing, dental, med spas, law firms, and more.",
  },
  {
    q: "What if I'm already using an answering service?",
    a: "Our AI outperforms traditional answering services at a fraction of the cost. It books appointments, qualifies leads, and syncs with your CRM — things most answering services can't do.",
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
              Common Questions
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              Frequently Asked
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">
              Everything you need to know before getting started.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
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
