import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import Reveal from "@/components/Reveal";

interface CalculatorConfig {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
}

const RevenueLeakCalculator = ({ title = "Revenue Leak Calculator", subtitle = "See how much revenue you're losing to missed calls.", showTitle = true }: CalculatorConfig) => {
  const [missedCalls, setMissedCalls] = useState([20]);
  const [avgJobValue, setAvgJobValue] = useState([2500]);
  const [conversionRate, setConversionRate] = useState([40]);

  const monthlyMissedRevenue = (missedCalls[0] * avgJobValue[0] * (conversionRate[0] / 100));
  const yearlyMissedRevenue = monthlyMissedRevenue * 12;
  const potentialGain = yearlyMissedRevenue - (monthlyMissedRevenue > 0 ? 299 * 12 : 0); // Assuming $299/month subscription

  return (
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-6">
        {showTitle && (
          <div className="text-center mb-16">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-silver-bright mb-4 tracking-[-0.02em]">
                {title}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-silver text-lg max-w-lg mx-auto">{subtitle}</p>
            </Reveal>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <Reveal delay={0.15}>
            <Card className="surface-card rounded-2xl p-8 md:p-12 border-primary/10">
              {/* Input Sliders */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Missed Calls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-display font-semibold text-foreground">Missed Calls/Month</label>
                    <span className="text-2xl font-mono font-bold text-warning">{missedCalls[0]}</span>
                  </div>
                  <Slider
                    value={missedCalls}
                    onValueChange={setMissedCalls}
                    min={5}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-silver">5 - 100 calls</p>
                </motion.div>

                {/* Average Job Value */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-display font-semibold text-foreground">Avg. Job Value</label>
                    <span className="text-2xl font-mono font-bold text-warning">${avgJobValue[0].toLocaleString()}</span>
                  </div>
                  <Slider
                    value={avgJobValue}
                    onValueChange={setAvgJobValue}
                    min={500}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                  <p className="text-xs text-silver">$500 - $10,000</p>
                </motion.div>

                {/* Conversion Rate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-display font-semibold text-foreground">Conversion %</label>
                    <span className="text-2xl font-mono font-bold text-warning">{conversionRate[0]}%</span>
                  </div>
                  <Slider
                    value={conversionRate}
                    onValueChange={setConversionRate}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-silver">10% - 100%</p>
                </motion.div>
              </div>

              {/* Results */}
              <div className="space-y-6 pt-8 border-t border-border">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-warning/10 to-primary/10 rounded-xl p-6"
                >
                  <p className="text-xs text-silver mb-2 uppercase font-mono">Monthly Revenue Leak</p>
                  <motion.p
                    key={monthlyMissedRevenue}
                    className="text-4xl md:text-5xl font-mono font-bold text-warning"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    ${monthlyMissedRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </motion.p>
                  <p className="text-xs text-silver mt-2">That's {missedCalls[0]} calls × ${avgJobValue[0]} × {conversionRate[0]}%</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary/5 rounded-xl p-6 border border-primary/10"
                  >
                    <p className="text-xs text-silver mb-2 uppercase font-mono">Annual Revenue Leak</p>
                    <p className="text-3xl font-mono font-bold text-foreground">${yearlyMissedRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-success/5 rounded-xl p-6 border border-success/20"
                  >
                    <p className="text-xs text-silver mb-2 uppercase font-mono">Annual ROI with Voxmation</p>
                    <p className="text-3xl font-mono font-bold text-success">${potentialGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-sm text-silver leading-relaxed pt-4"
                >
                  Voxmation covers that revenue leak for just{" "}
                  <span className="font-semibold text-warning">$299/month</span>. Most home service businesses recover this investment within the first month.
                </motion.p>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default RevenueLeakCalculator;
