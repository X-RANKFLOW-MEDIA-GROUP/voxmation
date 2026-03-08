import { motion } from "framer-motion";
import { Workflow, Power, Pause, MessageSquare, UserCheck, Star, Bell, RotateCcw } from "lucide-react";
import StatusBadge from "@/components/portal/StatusBadge";
import type { LucideIcon } from "lucide-react";

interface Automation {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: LucideIcon;
  status: "active" | "paused" | "draft";
  triggerCount: number;
  lastTriggered: string;
}

const demoAutomations: Automation[] = [
  { id: "1", name: "Missed Call Text-Back", description: "Sends an instant SMS when a call is missed, asking how we can help.", type: "missed_call_textback", icon: MessageSquare, status: "active", triggerCount: 847, lastTriggered: "2 min ago" },
  { id: "2", name: "Lead Follow-Up Sequence", description: "Multi-touch follow-up via SMS and email over 7 days for new leads.", type: "lead_followup", icon: UserCheck, status: "active", triggerCount: 1234, lastTriggered: "15 min ago" },
  { id: "3", name: "Review Request", description: "Sends a review request via SMS 24 hours after a completed job.", type: "review_request", icon: Star, status: "active", triggerCount: 356, lastTriggered: "1h ago" },
  { id: "4", name: "Appointment Reminder", description: "Sends confirmation 24h before and reminder 2h before appointments.", type: "reminder", icon: Bell, status: "active", triggerCount: 2103, lastTriggered: "30 min ago" },
  { id: "5", name: "Re-Engagement Campaign", description: "Reaches out to cold leads after 30 days of no activity.", type: "reengagement", icon: RotateCcw, status: "paused", triggerCount: 89, lastTriggered: "3 days ago" },
  { id: "6", name: "No-Show Follow-Up", description: "Automatically reschedules appointments for no-shows.", type: "no_show", icon: RotateCcw, status: "active", triggerCount: 42, lastTriggered: "2 days ago" },
];

const Automations = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-1">
        <Workflow className="h-5 w-5 text-primary/60" />
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Automations</h1>
      </div>
      <p className="text-silver text-sm font-mono mb-8">All active workflows running for your business</p>
    </motion.div>

    <div className="grid md:grid-cols-2 gap-4">
      {demoAutomations.map((auto, i) => (
        <motion.div
          key={auto.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="surface-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                <auto.icon className="h-5 w-5 text-primary/70" />
              </div>
              <div>
                <p className="text-sm font-mono font-bold text-foreground">{auto.name}</p>
                <p className="text-[10px] font-mono text-silver">{auto.type.replace(/_/g, " ")}</p>
              </div>
            </div>
            <StatusBadge status={auto.status} />
          </div>

          <p className="text-xs text-silver font-mono leading-relaxed mb-5">{auto.description}</p>

          <div className="flex items-center justify-between border-t border-border/30 pt-4">
            <div>
              <p className="text-lg font-mono font-bold text-foreground">{auto.triggerCount.toLocaleString()}</p>
              <p className="text-[10px] font-mono text-silver">Total triggers</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-silver-bright">{auto.lastTriggered}</p>
              <p className="text-[10px] font-mono text-silver">Last triggered</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Automations;
