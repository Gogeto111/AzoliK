"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { softSpring } from "@/lib/motion";

interface ActionStepProps {
  text: string;
  status: "running" | "done";
}

export function ActionStep({ text, status }: ActionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={softSpring}
      className="flex items-center gap-3 py-1.5"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {status === "done" ? (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
          </motion.div>
        ) : (
          <Loader2 className="h-4 w-4 text-brand-400 animate-spin" />
        )}
      </div>
      <span className="text-sm text-white/80">{text}</span>
    </motion.div>
  );
}
