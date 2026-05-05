import { useParams, Link } from "react-router-dom";
import { verticalsData, statesData, stateIntros, complianceNotes } from "@/data/seoData";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { ArrowRight, ChevronLeft } from "lucide-react";

export default function StateVerticalPage() {
  const { vertical, state } = useParams<{ vertical: string; state: string }>();
  
  const verticalData = vertical ? verticalsData[vertical as keyof typeof verticalsData] : null;
  const stateData = state ? statesData.find(s => s.slug === state) : null;

  if (!verticalData || !stateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-text-secondary">Page not found.</p>
      </div>
    );
  }

  const stateIntro = stateIntros[state as keyof typeof stateIntros];
  const complianceNote = complianceNotes[state as keyof typeof complianceNotes];
  const Icon = verticalData.icon || (() => null);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${verticalData.name} AI in ${stateData.name} | Voxmation`}
        description={`Voxmation AI voice agents for ${verticalData.name.toLowerCase()} contractors in ${stateData.name}. Answer every call 24/7 in ${stateData.name}.`}
        path={`/${verticalData.slug}/${state}`}
        type="website"
      />
      <Navbar />

      {/* Breadcrumb & Back */}
      <section className="py-6 px-6 bg-zinc-900/50 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <Link 
            to={`/${verticalData.slug}`}
            className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {verticalData.name}
          </Link>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-mono text-brand-accent uppercase">
              {stateData.code}
            </span>
            <span className="text-sm font-mono text-text-secondary">•</span>
            <span className="text-sm font-mono text-text-secondary uppercase">
              {verticalData.name}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {verticalData.name} AI in {stateData.name}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl">
            {stateIntro}
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
            Get Started in {stateData.name} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Why This Matters Here */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Why {verticalData.name} Contractors in {stateData.name} Need AI Call Handling
        </h2>
        <p className="text-lg text-text-secondary leading-relaxed">
          {verticalData.subheadline} In {stateData.name}, where competition is intense and customer expectations are high, Voxmation ensures you never lose a lead.
        </p>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            What {verticalData.name} Contractors Get
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {verticalData.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases in This State */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Use Cases in {stateData.name}
        </h2>
        <ul className="space-y-4">
          {verticalData.useCases.map((useCase, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-brand-accent text-xl font-bold mt-1">•</span>
              <span className="text-lg text-text-secondary">{useCase}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Compliance Note */}
      {complianceNote && (
        <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-6">
              <p className="text-text-secondary text-sm">{complianceNote}</p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          {verticalData.name} Contractors in {stateData.name} Ask
        </h2>
        <div className="space-y-6">
          {verticalData.faqItems.map((item, idx) => (
            <div key={idx} className="border-b border-zinc-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">{item.q}</h3>
              <p className="text-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 border-y border-brand-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started in {stateData.name}?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Join {verticalData.name} contractors across {stateData.name} who are answering every call and booking more jobs.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors">
            Get Your Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
