"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = { children: React.ReactNode; delay?: number; className?: string };

export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      // Initial state must match the server render; reduced motion only drops the rise (y snaps instantly).
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={
        reduce
          ? { opacity: { duration: 0.45, delay }, y: { duration: 0 } }
          : { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </motion.div>
  );
}
