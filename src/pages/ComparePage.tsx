import { useParams, Navigate, Link } from "react-router-dom";
import { compareData, COMPARE_DISCLAIMER, LAST_UPDATED } from "@/data/seoExpansion";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import FAQWithSchema from "@/components/FAQWithSchema";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check } from "lucide-react";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const BASE = "https://voxmation.com";

export default function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? compareData[slug] : null;

  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const path = `/compare/${data.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: `VOXmatiON vs ${data.competitor}`, item: `${BASE}${path}` },
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
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">Comparison</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                VOXmatiON vs {data.competitor}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-sm font-mono">Last updated: {LAST_UPDATED}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 max-w-4xl">
        {/* Quick verdict */}
        <section className="py-8 md:py-12">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-4 tracking-[-0.02em]">
              Quick Verdict
            </h2>
            <p className="text-silver text-base md:text-lg leading-relaxed">{data.verdict}</p>
          </Reveal>
        </section>

        {/* Feature comparison table */}
        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
              Feature Comparison
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-x-auto surface-card rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-display text-foreground">Strengths</th>
                    <th className="text-left p-4 font-display text-primary">VOXmatiON</th>
                    <th className="text-left p-4 font-display text-foreground">{data.competitor}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border align-top">
                    <td className="p-4 text-silver">Where it stands out</td>
                    <td className="p-4">
                      <ul className="space-y-2">
                        {data.voxmationStrengths.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-silver">
                            <Check className="h-4 w-4 text-primary/80 mt-0.5 shrink-0" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul className="space-y-2">
                        {data.competitorStrengths.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-silver">
                            <Check className="h-4 w-4 text-silver/50 mt-0.5 shrink-0" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* Pricing model comparison */}
        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-4 tracking-[-0.02em]">
              Pricing Model Comparison
            </h2>
            <p className="text-silver text-base leading-relaxed">
              VOXmatiON uses predictable, volume-based plans for AI answering, missed-call recovery, and automation. {data.competitor}'s
              pricing structure differs and changes over time. Compare both providers' current pricing for your call volume on their
              official websites before deciding.
            </p>
          </Reveal>
        </section>

        {/* Best fit */}
        <section className="py-8 md:py-12 border-t border-border">
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal scale>
              <div className="surface-card rounded-2xl p-6 h-full">
                <h2 className="text-lg font-display font-bold text-primary mb-3">When to Choose VOXmatiON</h2>
                <p className="text-silver text-sm leading-relaxed">{data.bestForVoxmation}</p>
              </div>
            </Reveal>
            <Reveal scale delay={0.1}>
              <div className="surface-card rounded-2xl p-6 h-full">
                <h2 className="text-lg font-display font-bold text-foreground mb-3">When to Choose {data.competitor}</h2>
                <p className="text-silver text-sm leading-relaxed">{data.bestForCompetitor}</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* About competitor + disclaimer */}
        <section className="py-8 md:py-12 border-t border-border">
          <Reveal>
            <h2 className="text-xl font-display font-bold text-silver-bright mb-3">About {data.competitor}</h2>
            <p className="text-silver text-sm leading-relaxed mb-6">{data.about}</p>
            <p className="text-xs text-silver/70 italic border-l-2 border-border pl-4">{COMPARE_DISCLAIMER}</p>
          </Reveal>
        </section>
      </main>

      <FAQWithSchema faqs={data.faqs} title="Comparison FAQ" subtitle="Common questions about this comparison." />

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
                Book a demo and compare VOXmatiON against {data.competitor} on your own calls.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="neon" size="xl" asChild className="gap-2">
                  <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Book a VOXmatiON Demo <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/pricing">Compare Plans</Link>
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
