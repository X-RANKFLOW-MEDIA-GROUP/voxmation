import { useParams, Navigate, Link } from "react-router-dom";
import { alternativesData, COMPARE_DISCLAIMER, LAST_UPDATED } from "@/data/seoExpansion";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import FAQWithSchema from "@/components/FAQWithSchema";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check } from "lucide-react";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const BASE = "https://voxmation.com";

export default function AlternativePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? alternativesData[slug] : null;

  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const path = `/alternatives/${data.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: data.heading, item: `${BASE}${path}` },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={data.title}
        description={data.metaDescription}
        path={path}
        jsonLd={[breadcrumbSchema, faqSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">Alternative</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                {data.heading}: VOXmatiON
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-4 max-w-2xl mx-auto">{data.intro}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-silver text-sm font-mono">Last updated: {LAST_UPDATED}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 max-w-4xl">
        <section className="py-8 md:py-12">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
              Why Service Businesses Pick VOXmatiON
            </h2>
          </Reveal>
          <div className="grid gap-4">
            {data.reasons.map((r, i) => (
              <Reveal key={r} delay={0.05 * i}>
                <div className="surface-card rounded-xl p-5 flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary/80 mt-0.5 shrink-0" />
                  <span className="text-silver text-base">{r}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <p className="text-xs text-silver/70 italic border-l-2 border-border pl-4">{COMPARE_DISCLAIMER}</p>
          </Reveal>
        </section>
      </main>

      <FAQWithSchema faqs={data.faqs} title="FAQ" subtitle="Common questions about switching to VOXmatiON." />

      {/* CTA */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                See VOXmatiON in action.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a demo and see how VOXmatiON answers, qualifies, and recovers calls for your business.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="neon" size="xl" asChild className="gap-2">
                  <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Book a Demo <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/pricing">See Pricing</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
