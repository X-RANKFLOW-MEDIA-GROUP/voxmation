import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import RevenueLeakCalculator from "@/components/RevenueLeakCalculator";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { VOXMATION_DEMO_URL } from "@/lib/contact";

const BASE = "https://voxmation.com";
const PATH = "/tools/missed-call-roi-calculator";

const industryExamples = [
  { industry: "HVAC", calls: 20, job: 750, close: 30, risk: 4500 },
  { industry: "Plumbing", calls: 25, job: 450, close: 35, risk: 3938 },
  { industry: "Roofing", calls: 15, job: 8000, close: 20, risk: 24000 },
  { industry: "Electrical", calls: 18, job: 600, close: 30, risk: 3240 },
];

const EMBED_SNIPPET = `<iframe
  src="https://www.voxmation.com/tools/missed-call-roi-calculator?embed=1"
  width="100%" height="720" style="border:0;max-width:720px"
  title="Missed Call ROI Calculator by VOXmatiON"
  loading="lazy"></iframe>`;

export default function MissedCallRoiCalculator() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${BASE}/tools/missed-call-roi-calculator` },
      { "@type": "ListItem", position: 3, name: "Missed Call ROI Calculator", item: `${BASE}${PATH}` },
    ],
  };
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Missed Call ROI Calculator",
    url: `${BASE}${PATH}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Free calculator that estimates the monthly and annual revenue a service business loses to missed calls, and how much VOXmatiON could recover.",
    provider: { "@type": "Organization", "@id": `${BASE}/#organization`, name: "VOXmatiON", url: BASE },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Missed Call ROI Calculator | Estimate Lost Revenue — VOXmatiON"
        description="Free missed call ROI calculator for service businesses. Estimate the revenue you lose to missed calls and how much VOXmatiON could recover. Adjust calls, job value, and close rate."
        path={PATH}
        keywords="missed call roi calculator, lost revenue calculator, missed call cost, missed call recovery roi, AI receptionist roi"
        jsonLd={[breadcrumbSchema, webAppSchema]}
      />
      <Navbar />

      <section className="pt-32 pb-8 md:pt-40 md:pb-12 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 max-w-3xl text-center">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">Free Tool</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
              Missed Call ROI Calculator
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg md:text-xl leading-relaxed">
              Estimate how much revenue your business loses to missed calls every month — and how much VOXmatiON could
              recover.
            </p>
          </Reveal>
        </div>
      </section>

      <main>
        {/* Calculator */}
        <RevenueLeakCalculator
          title="Estimate Your Missed-Call Revenue"
          subtitle="Adjust the sliders to match your business."
        />

        {/* Formula explanation */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-6 max-w-3xl">
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-4 tracking-[-0.02em]">
                How the Calculation Works
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="surface-card rounded-2xl p-6 font-mono text-sm text-silver space-y-2 mb-6">
                <p>Revenue at Risk = Monthly Missed Calls × Average Job Value × Close Rate</p>
                <p>Recovered Revenue = Revenue at Risk × Recovery Rate</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-base leading-relaxed">
                Example: 20 missed calls × $750 average job value × 30% close rate = <strong className="text-foreground">$4,500</strong>{" "}
                in monthly revenue at risk. At a 30% recovery rate, that's <strong className="text-foreground">$1,350</strong> recovered
                every month. These figures are estimates — your actual numbers depend on your call volume, pricing, and close rate.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Industry examples */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
                Examples by Industry
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="overflow-x-auto surface-card rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="p-4 font-display text-foreground">Industry</th>
                      <th className="p-4 font-display text-foreground">Missed calls/mo</th>
                      <th className="p-4 font-display text-foreground">Avg job value</th>
                      <th className="p-4 font-display text-foreground">Close rate</th>
                      <th className="p-4 font-display text-primary">Revenue at risk/mo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryExamples.map((e) => (
                      <tr key={e.industry} className="border-b border-border">
                        <td className="p-4 text-foreground">{e.industry}</td>
                        <td className="p-4 text-silver">{e.calls}</td>
                        <td className="p-4 text-silver">${e.job.toLocaleString()}</td>
                        <td className="p-4 text-silver">{e.close}%</td>
                        <td className="p-4 font-mono font-bold text-warning">${e.risk.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-xs text-silver/70 mt-4 italic">
                Illustrative examples only. Adjust the calculator above with your own numbers for an estimate specific to your business.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Embed snippet */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-6 max-w-3xl">
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-4 tracking-[-0.02em]">
                Embed This Calculator
              </h2>
              <p className="text-silver text-base leading-relaxed mb-4">
                Free to embed on your blog or website. Copy the snippet below.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <pre className="surface-card rounded-2xl p-6 overflow-x-auto text-xs text-silver font-mono whitespace-pre-wrap break-all">
                {EMBED_SNIPPET}
              </pre>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-sm mt-6">
                Learn more about{" "}
                <Link to="/missed-call-recovery" className="text-primary hover:underline">missed call recovery</Link>{" "}
                or see{" "}
                <Link to="/how-it-works" className="text-primary hover:underline">how VOXmatiON works</Link>.
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Recover that revenue.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Book a demo and see VOXmatiON answer, qualify, and recover calls for your business.
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
