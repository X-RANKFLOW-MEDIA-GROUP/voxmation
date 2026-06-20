import { useParams, Navigate, Link } from "react-router-dom";
import { industryReceptionists } from "@/data/seoExpansion";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import FAQWithSchema from "@/components/FAQWithSchema";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, PhoneCall } from "lucide-react";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const BASE = "https://voxmation.com";

export default function IndustryReceptionistPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? industryReceptionists[slug] : null;

  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const path = `/industries/${data.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Industries", item: `${BASE}/industries` },
      { "@type": "ListItem", position: 3, name: `AI Receptionist for ${data.industry}`, item: `${BASE}${path}` },
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
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                {data.industry}
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                AI Receptionist for {data.industry}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">{data.intro}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="neon" size="xl" asChild className="gap-2">
                  <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Book a Demo <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild className="gap-2">
                  <Link to="/pricing">See Pricing</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <main>
        {/* Never miss a call */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Reveal>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
                Never Miss a High-Intent {data.industry} Call Again
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                Why {data.industry} Businesses Lose Leads by Phone
              </h3>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-base md:text-lg leading-relaxed">{data.whyLoseLeads}</p>
            </Reveal>
          </div>
        </section>

        {/* How VOXmatiON handles calls */}
        <section className="py-12 md:py-20 border-t border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-silver-bright mb-10 tracking-[-0.02em] text-center">
                How VOXmatiON Handles {data.industry} Calls
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.callTypes.map((ct, i) => (
                <Reveal key={ct.name} delay={0.06 * i} scale>
                  <div className="surface-card rounded-2xl p-6 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <PhoneCall className="h-5 w-5 text-primary/85" />
                      <h3 className="text-base font-display font-bold text-foreground">{ct.name}</h3>
                    </div>
                    <p className="text-silver text-sm leading-relaxed">{ct.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Example call */}
        <section className="py-12 md:py-20 border-t border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <Reveal>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
                A Realistic {data.industry} Call, Handled End to End
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="surface-card rounded-2xl p-8 italic text-silver text-base md:text-lg leading-relaxed border-l-2 border-primary/30">
                {data.exampleCall}
              </blockquote>
            </Reveal>
          </div>
        </section>

        {/* CRM + Missed call recovery cross-links */}
        <section className="py-12 md:py-20 border-t border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-6">
              <Reveal scale>
                <div className="surface-card rounded-2xl p-8 h-full">
                  <h2 className="text-xl font-display font-bold text-foreground mb-3">CRM and Follow-Up Automation</h2>
                  <p className="text-silver text-sm leading-relaxed mb-4">
                    Every qualified {data.industry.toLowerCase()} lead is logged in your CRM, with automated SMS
                    follow-up that keeps the conversation going until the job is booked.
                  </p>
                  <ul className="space-y-2">
                    {["Automatic CRM updates", "SMS follow-up sequences", "Appointment routing"].map((x) => (
                      <li key={x} className="flex items-center gap-2 text-sm text-silver">
                        <Check className="h-4 w-4 text-primary/80" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal scale delay={0.1}>
                <div className="surface-card rounded-2xl p-8 h-full">
                  <h2 className="text-xl font-display font-bold text-foreground mb-3">
                    Missed Call Recovery for {data.industry}
                  </h2>
                  <p className="text-silver text-sm leading-relaxed mb-4">
                    When a call is missed, VOXmatiON sends an instant SMS textback and qualifies the lead automatically.
                    Learn more on our{" "}
                    <Link to="/missed-call-recovery" className="text-primary hover:underline">
                      missed call recovery
                    </Link>{" "}
                    page, or see exactly{" "}
                    <Link to="/how-it-works" className="text-primary hover:underline">
                      how it works
                    </Link>
                    .
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools/missed-call-roi-calculator">Calculate Missed Revenue</Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <FAQWithSchema
          faqs={data.faqs}
          title={`${data.industry} AI Receptionist FAQ`}
          subtitle={`Common questions about VOXmatiON for ${data.industry.toLowerCase()} businesses.`}
        />
      </main>

      {/* CTA */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Stop missing {data.industry.toLowerCase()} calls.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a demo and watch VOXmatiON answer, qualify, and route a live {data.industry.toLowerCase()} call.
              </p>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Book a Demo <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
