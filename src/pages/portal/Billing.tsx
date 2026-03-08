import { motion } from "framer-motion";
import { CreditCard, Check, ArrowUpRight, Receipt, Zap, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const currentPlan = {
  name: "Growth",
  icon: Building2,
  price: "$497",
  period: "/mo",
  nextBilling: "Apr 1, 2026",
  features: [
    "AI Call Answering (24/7)",
    "Up to 500 calls/month",
    "Missed Call Text-Back",
    "Full CRM Integration",
    "Up to 3 Phone Numbers",
    "Priority Support",
    "Multi-Channel Follow-Up",
    "Custom AI Training",
  ],
};

const addOns = [
  { name: "Additional Phone Number", price: "$29/mo", active: false },
  { name: "Premium Voice Clone", price: "$99/mo", active: true },
  { name: "White-Label Reports", price: "$49/mo", active: false },
  { name: "Dedicated Account Manager", price: "$199/mo", active: false },
];

const invoices = [
  { date: "Mar 1, 2026", amount: "$596.00", status: "Paid", desc: "Growth Plan + Premium Voice Clone" },
  { date: "Feb 1, 2026", amount: "$596.00", status: "Paid", desc: "Growth Plan + Premium Voice Clone" },
  { date: "Jan 1, 2026", amount: "$497.00", status: "Paid", desc: "Growth Plan" },
  { date: "Dec 1, 2025", amount: "$497.00", status: "Paid", desc: "Growth Plan" },
];

const Billing = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-1">
        <CreditCard className="h-5 w-5 text-primary/60" />
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Billing</h1>
      </div>
      <p className="text-silver text-sm font-mono mb-8">Manage your subscription and invoices</p>
    </motion.div>

    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 surface-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono text-primary tracking-wider uppercase mb-2">Current Plan</p>
            <h2 className="text-xl font-display font-bold text-foreground">{currentPlan.name}</h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-mono font-bold text-foreground">{currentPlan.price}</span>
            <span className="text-xs font-mono text-silver">{currentPlan.period}</span>
            <p className="text-[10px] font-mono text-silver mt-1">Next billing: {currentPlan.nextBilling}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mb-6">
          {currentPlan.features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-mono text-silver-bright">{f}</span>
            </div>
          ))}
        </div>

        <Button variant="neon-outline" size="sm" className="gap-2">
          Upgrade Plan <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </motion.div>

      {/* Add-ons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface-card rounded-2xl p-6"
      >
        <p className="text-[10px] font-mono text-primary tracking-wider uppercase mb-4">Add-ons</p>
        <div className="space-y-3">
          {addOns.map((a) => (
            <div key={a.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div>
                <p className="text-xs font-mono text-foreground">{a.name}</p>
                <p className="text-[10px] font-mono text-silver">{a.price}</p>
              </div>
              <button className={`text-[10px] font-mono px-3 py-1 rounded-lg transition-colors ${
                a.active
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-silver bg-muted hover:text-primary hover:bg-primary/10"
              }`}>
                {a.active ? "Active" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Invoices */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="surface-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Receipt className="h-4 w-4 text-primary/60" />
        <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">Invoices</h3>
      </div>
      <div className="space-y-2">
        {invoices.map((inv, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-silver w-24">{inv.date}</span>
              <span className="text-xs font-mono text-silver-bright">{inv.desc}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-bold text-foreground">{inv.amount}</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg">{inv.status}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default Billing;
