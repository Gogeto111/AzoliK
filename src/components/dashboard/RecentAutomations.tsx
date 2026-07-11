import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RECENT_AUTOMATIONS } from "@/data/mockData";
import { Play, Pause, Clock, ArrowRight, MoreHorizontal } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const statusTone = {
  running: "emerald" as const,
  scheduled: "brand" as const,
  paused: "muted" as const,
};
const statusIcon = {
  running: Play,
  scheduled: Clock,
  paused: Pause,
};

export function RecentAutomations() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  return (
    <GlassCard ref={ref} className="p-0" tilt={false}>
      <div className="flex items-center justify-between p-5 pb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-white">Recent Automations</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Live workflows running across your workforce
          </p>
        </div>
        <button className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white">
          View all
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {RECENT_AUTOMATIONS.map((a, i) => {
          const Icon = statusIcon[a.status];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 * i }}
              whileHover={prefersReduced ? undefined : { backgroundColor: "rgba(255,255,255,0.025)" }}
              className="group relative flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors"
            >
              <motion.div
                whileHover={prefersReduced ? undefined : { scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 14 }}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  a.status === "running" && "bg-emerald-500/10 text-emerald-300",
                  a.status === "scheduled" && "bg-brand-500/10 text-brand-300",
                  a.status === "paused" && "bg-ink-700/40 text-ink-400"
                )}
              >
                <Icon className={cn("h-4 w-4", a.status === "running" && "animate-pulse")} strokeWidth={2.2} />
                {a.status === "running" && !prefersReduced && (
                  <span className="absolute h-8 w-8 rounded-lg">
                    <span className="absolute inset-0 animate-ping rounded-lg bg-emerald-400/20" />
                  </span>
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-medium text-white">
                    {a.name}
                  </span>
                  <Badge tone={statusTone[a.status]} className="!text-[10px] !px-2">
                    {a.status}
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-400">
                  <span>{a.dept}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-ink-600" />
                  <span>{a.runs.toLocaleString()} runs</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-ink-600" />
                  <span
                    className={cn(
                      a.success >= 99 ? "text-emerald-300" : a.success >= 95 ? "text-brand-300" : "text-amber-300"
                    )}
                  >
                    {a.success}% success
                  </span>
                </div>
              </div>
              <motion.button
                initial={{ opacity: 0, x: 6 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4 text-ink-400" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
