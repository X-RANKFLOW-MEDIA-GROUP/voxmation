import { useParams } from "react-router-dom";
import { resourcesData } from "@/data/seoData";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { ArrowRight, Calculator, FileText, TrendingUp } from "lucide-react";

export default function ResourcePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? resourcesData[slug as keyof typeof resourcesData] : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-text-secondary">Resource not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={data.title}
        description={data.metaDescription}
        path={`/resources/${data.slug}`}
        type="article"
      />
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {data.h1}
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed">{data.description}</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none">
          <div className="bg-zinc-800 rounded-lg p-8 border border-zinc-700 mb-12">
            <p className="text-lg text-text-secondary leading-relaxed">
              This comprehensive guide covers everything {data.name || "contractors"} need to know about {data.slug === "hvac-roi-calculator" ? "calculating ROI" : data.slug === "ai-voice-agent-compliance-home-service" ? "compliance requirements" : "missed call recovery"}.
            </p>
          </div>

          {data.slug === "hvac-roi-calculator" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Calculate Your HVAC AI ROI</h2>
                <div className="bg-zinc-800 rounded-lg p-8 border border-zinc-700">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        <Calculator className="w-5 h-5 inline mr-2" />
                        Missed Calls Per Month
                      </label>
                      <input type="number" placeholder="10" defaultValue={10} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        <TrendingUp className="w-5 h-5 inline mr-2" />
                        Average HVAC Job Value
                      </label>
                      <input type="number" placeholder="3500" defaultValue={3500} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        <TrendingUp className="w-5 h-5 inline mr-2" />
                        Your Closing Rate (%)
                      </label>
                      <input type="number" placeholder="35" defaultValue={35} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded" />
                    </div>
                    <button className="w-full bg-brand-accent text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                      Calculate ROI
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-8">
                <p className="text-text-secondary text-lg leading-relaxed">
                  Based on typical HVAC contractor data, implementing Voxmation can recover $8,000-$50,000+ in annual revenue from missed calls alone. Most contractors see positive ROI within 30 days.
                </p>
              </div>
            </div>
          )}

          {data.slug === "ai-voice-agent-compliance-home-service" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Key Compliance Requirements</h2>
                
                <div className="space-y-6">
                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">TCPA (Telephone Consumer Protection Act)</h3>
                    <p className="text-text-secondary">The TCPA requires prior express written consent before making automated calls to cell phones. Voxmation handles this with consent tracking and compliant call routing.</p>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">State-Specific Regulations</h3>
                    <p className="text-text-secondary">Some states have additional consumer protection laws. California, Texas, and New York have specific requirements around automated calling and messaging.</p>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Licensing Requirements</h3>
                    <p className="text-text-secondary">HVAC, plumbing, electrical, and roofing contractors need valid licenses in their state. Using AI doesn't change licensing requirements—contractors still need proper credentials.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.slug === "missed-call-recovery-strategy" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">The Framework for Missed Call Recovery</h2>
                
                <div className="space-y-6">
                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Step 1: Capture Every Missed Call</h3>
                    <p className="text-text-secondary">Use AI to answer calls immediately. No call goes to voicemail. Every caller speaks to your AI receptionist who captures their name, issue, and urgency.</p>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Step 2: Prioritize by Urgency</h3>
                    <p className="text-text-secondary">Not all calls are equal. Emergency calls get priority. Your team reviews urgent calls within minutes and routine calls within hours.</p>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Step 3: Follow Up Instantly</h3>
                    <p className="text-text-secondary">Voxmation books appointments directly or tags leads for your team to follow up with SMS, email, and phone calls automatically.</p>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Step 4: Track and Improve</h3>
                    <p className="text-text-secondary">Monitor which calls convert to jobs. See which team members close the best. Adjust your strategy weekly based on real data.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-zinc-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">How long does setup take?</h3>
              <p className="text-text-secondary">Most contractors are live within 24 hours. We handle all the technical setup—you just provide your business details and we handle the rest.</p>
            </div>
            <div className="border-b border-zinc-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Can I customize the AI for my business?</h3>
              <p className="text-text-secondary">Absolutely. Your AI learns your business specific responses, pricing, availability, and service offerings. The more you use it, the smarter it gets.</p>
            </div>
            <div className="border-b border-zinc-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">What if customers want to speak to a human?</h3>
              <p className="text-text-secondary">The AI can transfer calls to your team instantly, send SMS callbacks, or schedule a callback time. You control the handoff.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 border-y border-brand-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Recover Lost Revenue?</h2>
          <p className="text-lg text-text-secondary mb-8">
            Join contractors who are capturing missed calls and booking more jobs with Voxmation.
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
