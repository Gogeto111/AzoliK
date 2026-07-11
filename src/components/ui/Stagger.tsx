import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type StaggerGroupProps = {
  delay?: number;
  stagger?: number;
  children: React.ReactNode;
  className?: string;
};

const container: Variants = {
  hidden: {},
  show: (i: { delay: number; stagger: number }) => ({
    transition: {
      delayChildren: i.delay,
      staggerChildren: i.stagger,
    },
  }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)", scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 24, mass: 0.9 },
  },
};

export function StaggerGroup({
  children,
  delay = 0.04,
  stagger: staggerDur = 0.06,
  className,
}: StaggerGroupProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      custom={{ delay: prefersReduced ? 0 : delay, stagger: prefersReduced ? 0 : staggerDur }}
      className={className}
    >
      {React.Children.map(children, (c) => (
        <motion.div variants={prefersReduced ? undefined : item} className="contents">
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, type: "spring" as const, stiffness: 260, damping: 24 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
