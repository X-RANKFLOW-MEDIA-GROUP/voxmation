import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import SEOBreadcrumbs from "@/components/SEOBreadcrumbs";
import Reveal from "@/components/Reveal";
import FAQWithSchema from "@/components/FAQWithSchema";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCasesData } from "@/data/useCases";

const UseCaseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const useCase = slug ? useCasesData[slug] : null;

  if (!useCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Use Case Not Found</h1>
          <Link to="/use-cases" className="text-primary underline font-mono text-sm">Back to Use Cases</Link>
        </div>
      </div>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://voxmation.com/use-cases" },
      { "@type": "ListItem", position: 3, name: useCase.title, item: `https://voxmation.com/use-cases/${useCase.slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: useCase.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Voxmation",
    description: useCase.metaDescription,
    applicationCategory: "ProductivityApplication",
    offers: {
      "@type": "Offer",
      price: "299",
      priceCurrency: "USD",
      url: "https://cal.com/voxmation/meeting",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={useCase.title}
        description={useCase.metaDescription}
        path={`/use-cases/${useCase.slug}`}
        type="article"
        jsonLd={[breadcrumbSchema, faqSchema, softwareSchema]}
      />
      <Navbar />

      <SEOBreadcrumbs
        items={[
          { name: "Use Cases", path: "/use-cases" },
          { name: useCase.title.replace(" |", "").split("|")[0].trim(), path: `/use-cases/${useCase.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <useCase.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono">Use Case</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                {useCase.h1}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">{useCase.subheadline}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="neon" size="xl" asChild>
                  <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                    Start Free 14-Day Trial <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="neon-outline" size="xl" asChild>
                  <Link to="/demo" className="gap-2">
                    See a Live Demo <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {useCase.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 * i} scale>
                <div className="surface-card rounded-2xl p-8 text-center">
                  <p className="text-3xl md:text-4xl font-mono font-bold text-warning mb-2">{s.value}</p>
                  <p className="text-silver text-xs font-mono">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="surface-card rounded-2xl p-10 md:p-14">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 tracking-[-0.02em]">What is {useCase.title.split("|")[0].trim()}?</h2>
                <p className="text-silver-bright text-lg leading-relaxed">{useCase.overview}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              Key Benefits
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCase.benefits.map((b, i) => (
              <Reveal key={b.title} delay={0.1 * i} scale>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.4 } }}
                  className="surface-card rounded-2xl p-8 h-full group hover:border-primary/15 transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5">
                    <Check className="h-5 w-5 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3">{b.title}</h3>
                  <p className="text-silver text-sm leading-relaxed">{b.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              Real Scenarios
            </h2>
          </Reveal>
          <div className="max-w-3xl mx-auto space-y-6">
            {useCase.scenarios.map((scenario, i) => (
              <Reveal key={scenario.title} delay={0.1 * i} scale>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="surface-card rounded-2xl p-8 md:p-10 group hover:border-primary/15 transition-all duration-500"
                >
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4">{scenario.title}</h3>
                  <p className="text-silver text-base leading-relaxed">{scenario.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
              Features Included
            </h2>
          </Reveal>
          <div className="max-w-3xl mx-auto">
            <Reveal delay={0.1}>
              <div className="grid sm:grid-cols-2 gap-4">
                {useCase.features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <Check className="h-4 w-4 text-primary/70 flex-shrink-0 mt-1" />
                    <span className="text-sm text-silver">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQWithSchema faqs={useCase.faqs} title="Questions About This Use Case" showHeader />

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Ready to implement {useCase.title.split("|")[0].trim()}?
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">{useCase.cta}</p>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  Start Free Trial <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default UseCaseDetail;
