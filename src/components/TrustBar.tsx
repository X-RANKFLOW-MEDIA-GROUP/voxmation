import { motion } from "framer-motion";
import { Shield, Clock, CreditCard, Headphones } from "lucide-react";

const items = [
  { icon: Shield, label: "No Contracts" },
  { icon: Clock, label: "Setup in 24h" },
  { icon: CreditCard, label: "30-Day Money Back" },
  { icon: Headphones, label: "English & Portuguese Support" },
];

const TrustBar = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.1 }}
    className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8"
  >
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <item.icon className="h-3.5 w-3.5 text-primary/50" />
        <span className="text-[11px] text-silver font-mono tracking-wide">{item.label}</span>
      </div>
    ))}
  </motion.div>
);

export default TrustBar;
