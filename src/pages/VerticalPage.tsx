import { useParams, Navigate } from "react-router-dom";
import { verticalsData } from "@/data/seoData";
import { generateFaqSchema, generateSoftwareApplicationSchema, generateBreadcrumbSchema } from "@/lib/schemaHelpers";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import IndustryPage from "./IndustryPage";

// Industry page slugs that should redirect to IndustryPage
const industryPageSlugs = [
  "ai-voice-agent-for-plumbers",
  "ai-receptionist-electricians", 
  "ai-booking-agent-spa-salon",
  "ai-intake-agent-law-office",
  "ai-voice-agent-hvac",
];

export default function VerticalPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Check if this slug should be handled by IndustryPage
  if (slug && industryPageSlugs.includes(slug)) {
    // Render IndustryPage component inline to avoid redirect loop
    return <IndustryPage />;
  }
  
  // Check for vertical data
  const data = slug ? verticalsData[slug as keyof typeof verticalsData] : null;

  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const Icon = data.icon || (() => null);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={data.title}
        description={data.metaDescription}
        path={`/${data.slug}`}
        type="website"
        jsonLd={[
          generateFaqSchema(data.faqItems),
          generateSoftwareApplicationSchema(data.name)
        ]}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Icon className="w-12 h-12 text-brand-accent" />
            <span className="text-sm font-mono text-brand-secondary uppercase tracking-wide">
              {data.name}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {data.h1}
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed mb-8">
            {data.subheadline}
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
            Get Your Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{data.problemTitle}</h2>
          <p className="text-lg text-text-secondary leading-relaxed">{data.problemDescription}</p>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            How Voxmation Helps {data.name} Contractors
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {data.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Common Use Cases</h2>
        <ul className="space-y-4">
          {data.useCases.map((useCase, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-brand-accent text-xl font-bold mt-1">•</span>
              <span className="text-lg text-text-secondary">{useCase}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Compliance Note */}
      {data.complianceNote && (
        <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-6">
              <p className="text-text-secondary">{data.complianceNote}</p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {data.faqItems.map((item, idx) => (
            <div key={idx} className="border-b border-zinc-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">{item.q}</h3>
              <p className="text-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 border-y border-brand-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Stop Missing {data.name} Calls?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Get your free 7-day trial. No credit card required. See how much revenue you could recover.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors">
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
