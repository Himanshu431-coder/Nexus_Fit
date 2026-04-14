import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function MotionCard({ children, className, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-nexus-border bg-nexus-surface p-6 transition-colors hover:border-nexus-border/80 hover:brightness-110",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
