import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { QUICK_ACTIONS } from "@/data/mockData";
import { Bot, Workflow, Blocks, UserPlus, ArrowUpRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const iconMap = {
  brand: Bot,
  violet: Workflow,
  cyan: Blocks,
  emerald: UserPlus,
};
const toneBg = {
  brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
  violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
  cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
  emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
};

export function QuickActions() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  return (
    <GlassCard ref={ref} className="p-5" tilt={false}>
      <h3 className="text-[15px] font-semibold text-white">Quick Actions</h3>
      <p className="mt-0.5 text-[12.5px] text-ink-400">Jump straight back into work</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = iconMap[a.tone as keyof typeof iconMap];
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.05 * i }}
              whileHover={prefersReduced ? undefined : { y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.05]"
            >
              <motion.div
                whileHover={prefersReduced ? undefined : { rotate: -8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                  toneBg[a.tone as keyof typeof toneBg]
                )}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <div>
                <div className="text-[13px] font-medium text-white">{a.label}</div>
                <div className="text-[11.5px] text-ink-400">{a.hint}</div>
              </div>
              <ArrowUpRight className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-ink-500 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-ink-200" />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                style={{
                  background:
                    a.tone === "brand" ? "rgba(95,131,255,0.5)" :
                    a.tone === "violet" ? "rgba(139,92,246,0.5)" :
                    a.tone === "cyan" ? "rgba(6,182,212,0.5)" :
                    "rgba(16,185,129,0.5)",
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );
}
