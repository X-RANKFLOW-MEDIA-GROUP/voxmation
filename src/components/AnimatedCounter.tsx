import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";

const AnimatedCounter = () => {
  const [count, setCount] = useState(12847);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.3 }}
      className="flex items-center justify-center gap-2 pt-6"
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-primary/3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--demo-green))] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--demo-green))]" />
        </span>
        <PhoneCall className="h-3 w-3 text-primary/60" />
        <span className="text-xs font-mono text-silver tracking-wide">
          <span className="text-primary font-bold">{count.toLocaleString()}</span> calls answered this week
        </span>
      </div>
    </motion.div>
  );
};

export default AnimatedCounter;
