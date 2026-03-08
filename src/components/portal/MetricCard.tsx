import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  delay?: number;
}

const MetricCard = ({ icon: Icon, label, value, change, changeType = "positive", delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="surface-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/15 transition-all duration-500"
  >
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary/70" />
      </div>
      {change && (
        <span
          className={`text-[11px] font-mono px-2 py-1 rounded-lg ${
            changeType === "positive"
              ? "text-emerald-400 bg-emerald-400/10"
              : changeType === "negative"
              ? "text-destructive bg-destructive/10"
              : "text-silver bg-muted"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <p className="text-2xl md:text-3xl font-mono font-bold text-foreground tracking-tight">{value}</p>
    <p className="text-xs font-mono text-silver mt-1 tracking-wide">{label}</p>
  </motion.div>
);

export default MetricCard;
