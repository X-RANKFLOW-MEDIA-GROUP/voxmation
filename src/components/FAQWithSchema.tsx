import Reveal from "@/components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQWithSchemaProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

const FAQWithSchema = ({
  faqs,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know.",
  showHeader = true,
}: FAQWithSchemaProps) => {
  // Generate FAQ schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <section id="faq" className="py-32 md:py-40 relative">
        <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

        <div className="container mx-auto px-6 relative z-10">
          {showHeader && (
            <div className="text-center mb-16">
              <Reveal>
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                  Questions?
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
                  {title}
                </h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="text-silver text-lg max-w-lg mx-auto leading-relaxed">{subtitle}</p>
              </Reveal>
            </div>
          )}

          <Reveal delay={0.2}>
            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <AccordionItem
                      value={`faq-${i}`}
                      className="surface-card rounded-2xl border border-border px-6 hover:border-primary/15 transition-all duration-500 data-[state=open]:border-primary/20 group"
                    >
                      <AccordionTrigger className="text-sm font-display font-semibold text-foreground hover:no-underline py-5 tracking-tight group-hover:text-primary/80 transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-silver text-sm leading-relaxed pb-5">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ Schema for SEO (dangerouslySetInnerHTML so JSON-LD isn't HTML-escaped during SSR) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
};

export default FAQWithSchema;
