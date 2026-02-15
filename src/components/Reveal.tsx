import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  scale?: boolean;
}

const directionMap = {
  up: { y: 50, x: 0 },
  down: { y: -50, x: 0 },
  left: { x: 50, y: 0 },
  right: { x: -50, y: 0 },
  none: { x: 0, y: 0 },
};

const Reveal = ({ children, className, delay = 0, direction = "up", scale = false }: RevealProps) => {
  const offset = directionMap[direction];

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...offset, 
        scale: scale ? 0.95 : 1,
        filter: "blur(8px)",
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
