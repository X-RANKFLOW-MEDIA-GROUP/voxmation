import { useParams, Link } from "react-router-dom";
import { comparisonsData } from "@/data/seoData";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { ArrowRight, Check, X } from "lucide-react";

export default function ComparisonPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? comparisonsData[slug as keyof typeof comparisonsData] : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-text-secondary">Comparison not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={data.title}
        description={data.metaDescription}
        path={`/${data.slug}`}
        type="website"
      />
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {data.h1}
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed mb-8">
            Honest comparison. No fluff. See which platform is right for your business.
          </p>
        </div>
      </section>

      {/* About Competitor */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Who is {data.competitor}?</h2>
        <p className="text-lg text-text-secondary leading-relaxed">{data.about}</p>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-4 px-4 font-semibold text-white">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-white">{data.competitor}</th>
                  <th className="text-center py-4 px-4 font-semibold text-brand-accent">Voxmation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4 text-text-secondary">Industry Specialization</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4 text-text-secondary">HVAC, Plumbing, Electrical, Roofing Support</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4 text-text-secondary">Direct CRM Integration</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4 text-text-secondary">24-Hour Setup</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4 text-text-secondary">No Coding Required</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4 text-text-secondary">Dedicated Contractor Support</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-text-secondary">Transparent Pricing</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-zinc-600 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Best For Section */}
      <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">When to Choose Each</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-3">{data.competitor} Works Best If...</h3>
            <p className="text-text-secondary">{data.bestFor}</p>
          </div>
          <div className="bg-brand-accent/10 p-6 rounded-lg border border-brand-accent/30">
            <h3 className="text-lg font-semibold text-white mb-3">Voxmation Works Best If...</h3>
            <ul className="space-y-2">
              {data.whyVoxmation.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-text-secondary">
                  <Check className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Contractors Choose Us */}
      <section className="py-20 md:py-28 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            Why Contractors Choose Voxmation Over {data.competitor}
          </h2>
          <div className="space-y-4">
            {data.whyVoxmation.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 border-b border-zinc-700">
                <Check className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-text-secondary text-lg">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 border-y border-brand-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Experience Voxmation for Yourself
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Try Voxmation free for 7 days. No credit card. No contract. See why contractors are making the switch.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
