import { motion } from "framer-motion";
import { Plug, Phone, Calendar, Database, Zap, CreditCard, Webhook } from "lucide-react";
import StatusBadge from "@/components/portal/StatusBadge";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: "connected" | "disconnected";
  category: string;
}

const integrations: Integration[] = [
  { id: "twilio", name: "Twilio", description: "Voice calls, SMS messaging, and phone number management.", icon: Phone, status: "connected", category: "Communication" },
  { id: "google_calendar", name: "Google Calendar", description: "Sync appointments and availability in real-time.", icon: Calendar, status: "connected", category: "Scheduling" },
  { id: "zoho", name: "Zoho CRM", description: "Sync leads, contacts, and deals automatically.", icon: Database, status: "disconnected", category: "CRM" },
  { id: "highlevel", name: "GoHighLevel", description: "Full CRM sync with pipelines, contacts, and automations.", icon: Database, status: "connected", category: "CRM" },
  { id: "stripe", name: "Stripe", description: "Payment processing, invoicing, and subscription management.", icon: CreditCard, status: "disconnected", category: "Billing" },
  { id: "zapier", name: "Zapier", description: "Connect 5,000+ apps with custom automation workflows.", icon: Webhook, status: "disconnected", category: "Automation" },
];

const Integrations = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-1">
        <Plug className="h-5 w-5 text-primary/60" />
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Integrations</h1>
      </div>
      <p className="text-silver text-sm font-mono mb-8">Connect your tools for seamless automation</p>
    </motion.div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {integrations.map((int, i) => (
        <motion.div
          key={int.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="surface-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/15 transition-all duration-500 flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
              <int.icon className="h-6 w-6 text-primary/70" />
            </div>
            <StatusBadge status={int.status} />
          </div>

          <h3 className="text-sm font-mono font-bold text-foreground mb-1">{int.name}</h3>
          <p className="text-[10px] font-mono text-primary/50 uppercase tracking-wider mb-3">{int.category}</p>
          <p className="text-xs text-silver font-mono leading-relaxed mb-5 flex-1">{int.description}</p>

          <Button
            variant={int.status === "connected" ? "ghost" : "neon-outline"}
            size="sm"
            className="w-full text-xs"
          >
            {int.status === "connected" ? "Configure" : "Connect"}
          </Button>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Integrations;
