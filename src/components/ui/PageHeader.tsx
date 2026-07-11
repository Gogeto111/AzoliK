import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { motion } from "framer-motion";

type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: { label: string; tone?: "brand" | "emerald" | "violet" | "muted" | "cyan" | "amber"; dot?: boolean; pulse?: boolean };
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={cn("mb-6 flex flex-wrap items-end justify-between gap-4 pt-1", className)}
    >
      <div>
        {badge && (
          <Badge tone={badge.tone ?? "brand"} dot={badge.dot} pulse={badge.pulse} className="mb-2.5">
            {badge.label}
          </Badge>
        )}
        <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-white md:text-[28px]">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-400 text-balance">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
