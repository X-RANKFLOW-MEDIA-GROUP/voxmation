import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calculator, Droplets, Zap, Sparkles, Scale, Flame, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface IndustryPreset {
  id: string;
  name: string;
  icon: LucideIcon;
  avgTicket: number;
  avgCallsPerDay: number;
  avgMissedPercent: number;
}

const presets: IndustryPreset[] = [
  { id: "plumbing", name: "Plumbing", icon: Droplets, avgTicket: 450, avgCallsPerDay: 12, avgMissedPercent: 35 },
  { id: "electrical", name: "Electrical", icon: Zap, avgTicket: 380, avgCallsPerDay: 10, avgMissedPercent: 30 },
  { id: "hvac", name: "HVAC", icon: Flame, avgTicket: 520, avgCallsPerDay: 15, avgMissedPercent: 40 },
  { id: "spa", name: "Spa & Salon", icon: Sparkles, avgTicket: 120, avgCallsPerDay: 20, avgMissedPercent: 25 },
  { id: "legal", name: "Law Office", icon: Scale, avgTicket: 2500, avgCallsPerDay: 8, avgMissedPercent: 30 },
];

const ROICalculator = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("plumbing");
  const [callsPerDay, setCallsPerDay] = useState(12);
  const [missedPercent, setMissedPercent] = useState(35);
  const [avgTicket, setAvgTicket] = useState(450);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");

  const preset = presets.find((p) => p.id === selectedIndustry)!;

  const selectIndustry = (id: string) => {
    const p = presets.find((x) => x.id === id)!;
    setSelectedIndustry(id);
    setCallsPerDay(p.avgCallsPerDay);
    setMissedPercent(p.avgMissedPercent);
    setAvgTicket(p.avgTicket);
    setShowResult(false);
  };

  const missedCallsPerDay = Math.round(callsPerDay * (missedPercent / 100));
  const missedCallsPerMonth = missedCallsPerDay * 22;
  const conversionRate = 0.35;
  const lostJobsPerMonth = Math.round(missedCallsPerMonth * conversionRate);
  const monthlyLoss = lostJobsPerMonth * avgTicket;
  const yearlyLoss = monthlyLoss * 12;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ROI Calculator — See How Much You Lose to Missed Calls"
        description="Calculate how much revenue your business loses to missed calls every month. Free ROI calculator for plumbers, HVAC, electricians, spas, and law offices."
        path="/roi-calculator"
      />
      <Navbar />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">ROI Calculator</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
              How Much Are Missed Calls Costing You?
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-silver text-lg max-w-xl mx-auto leading-relaxed">
              Enter your numbers. See the revenue you're leaving on the table.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Industry selector */}
            <Reveal>
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectIndustry(p.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-wide transition-all duration-300 ${
                      selectedIndustry === p.id ? "text-primary" : "text-silver hover:text-silver-bright"
                    }`}
                  >
                    {selectedIndustry === p.id && (
                      <motion.span layoutId="roi-tab" className="absolute inset-0 rounded-full bg-primary/8 border border-primary/15" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                    )}
                    <p.icon className="h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10">{p.name}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Calculator */}
            <Reveal delay={0.1}>
              <div className="surface-card rounded-2xl p-8 md:p-12">
                <div className="space-y-8">
                  {/* Calls per day */}
                  <div>
                    <label className="text-xs font-mono text-silver tracking-wider uppercase mb-3 block">
                      How many calls do you receive per day?
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={callsPerDay}
                        onChange={(e) => { setCallsPerDay(Number(e.target.value)); setShowResult(false); }}
                        className="flex-1 accent-[hsl(var(--primary))]"
                      />
                      <span className="text-2xl font-mono font-bold text-foreground w-16 text-right">{callsPerDay}</span>
                    </div>
                  </div>

                  {/* Missed % */}
                  <div>
                    <label className="text-xs font-mono text-silver tracking-wider uppercase mb-3 block">
                      What % of calls do you miss?
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={5}
                        max={80}
                        value={missedPercent}
                        onChange={(e) => { setMissedPercent(Number(e.target.value)); setShowResult(false); }}
                        className="flex-1 accent-[hsl(var(--primary))]"
                      />
                      <span className="text-2xl font-mono font-bold text-foreground w-16 text-right">{missedPercent}%</span>
                    </div>
                  </div>

                  {/* Average ticket */}
                  <div>
                    <label className="text-xs font-mono text-silver tracking-wider uppercase mb-3 block">
                      Average job/case value ($)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={50}
                        max={10000}
                        step={50}
                        value={avgTicket}
                        onChange={(e) => { setAvgTicket(Number(e.target.value)); setShowResult(false); }}
                        className="flex-1 accent-[hsl(var(--primary))]"
                      />
                      <span className="text-2xl font-mono font-bold text-foreground w-20 text-right">${avgTicket.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    variant="neon"
                    size="xl"
                    className="w-full gap-2"
                    onClick={() => setShowResult(true)}
                  >
                    <Calculator className="h-4 w-4" />
                    Calculate My Losses
                  </Button>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-10 pt-10 border-t border-border">
                        <div className="text-center mb-8">
                          <p className="text-xs font-mono text-warning tracking-wider uppercase mb-3">Your Estimated Monthly Loss</p>
                          <p className="text-5xl md:text-7xl font-mono font-bold text-warning tracking-tight">
                            ${monthlyLoss.toLocaleString()}
                          </p>
                          <p className="text-silver text-sm mt-2 font-mono">
                            That's <span className="text-warning font-bold">${yearlyLoss.toLocaleString()}/year</span> in lost revenue
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="text-center p-4 rounded-xl bg-primary/3 border border-primary/10">
                            <p className="text-2xl font-mono font-bold text-foreground">{missedCallsPerMonth}</p>
                            <p className="text-[10px] font-mono text-silver mt-1">Missed calls/mo</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-primary/3 border border-primary/10">
                            <p className="text-2xl font-mono font-bold text-foreground">{lostJobsPerMonth}</p>
                            <p className="text-[10px] font-mono text-silver mt-1">Lost jobs/mo</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-warning/5 border border-warning/15">
                            <p className="text-2xl font-mono font-bold text-warning">${monthlyLoss.toLocaleString()}</p>
                            <p className="text-[10px] font-mono text-silver mt-1">Revenue lost/mo</p>
                          </div>
                        </div>

                        {/* Email capture */}
                        <div className="surface-elevated rounded-xl p-6 text-center">
                          <p className="text-sm text-silver-bright font-display mb-4">
                            Get a detailed report with recovery strategy sent to your email
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30"
                            />
                            <Button variant="neon" size="lg" className="gap-2 shrink-0">
                              <Mail className="h-4 w-4" />
                              Send Report
                            </Button>
                          </div>
                        </div>

                        <div className="text-center mt-8">
                          <Button variant="neon" size="xl" asChild>
                            <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer" className="gap-2">
                              Stop Losing ${monthlyLoss.toLocaleString()}/mo — Book a Demo
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ROICalculator;
