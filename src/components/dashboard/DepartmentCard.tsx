import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Department } from "@/data/mockData";
import { ArrowUpRight, Bot, CheckCircle2, AlertCircle, PauseCircle } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useAI } from "@/lib/aiStore";

const statusMeta = {
  active: { label: "Active", tone: "emerald" as const, icon: CheckCircle2 },
  training: { label: "Training", tone: "amber" as const, icon: AlertCircle },
  idle: { label: "Idle", tone: "muted" as const, icon: PauseCircle },
};

const deptGlow = {
  brand: "rgba(95,131,255,0.35)",
  violet: "rgba(139,92,246,0.35)",
  cyan: "rgba(6,182,212,0.35)",
  emerald: "rgba(16,185,129,0.35)",
  amber: "rgba(245,158,11,0.35)",
  rose: "rgba(244,63,94,0.35)",
};

export function DepartmentCard({ dept, index = 0 }: { dept: Department; index?: number }) {
  const Icon = dept.icon;
  const StatusIcon = statusMeta[dept.status].icon;
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();
  const ai = useAI();

  const openDepartment = () => {
    ai.dispatch({ type: "OPEN_COPILOT" });
    ai.dispatch({
      type: "SEND_MESSAGE",
      content: `Show me the ${dept.name} department — agents, recent tasks, and anything that needs my attention.`,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 28,
        mass: 0.95,
        delay: index * 0.05,
      }}
    >
      <GlassCard interactive className="group relative overflow-hidden p-5">
        {/* Hover glow — single refined halo */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-12 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-60"
          )}
          style={{ background: deptGlow[dept.tone] }}
        />

        <div className="relative flex items-start justify-between">
          <motion.div
            whileHover={prefersReduced ? undefined : { rotate: [0, -6, 4, 0], scale: 1.05, transition: { type: "spring", stiffness: 500, damping: 14 } }}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10",
              dept.iconBg,
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", dept.iconColor)} strokeWidth={2} />
          </motion.div>
          <Badge tone={statusMeta[dept.status].tone} dot={dept.status === "active"} className="h-[18px]">
            <StatusIcon className="h-3 w-3" />
            {statusMeta[dept.status].label}
          </Badge>
        </div>

        <div className="relative mt-4">
          <h3 className="text-[15px] font-semibold tracking-[-0.015em] text-white">
            {dept.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.5] text-ink-400">
            {dept.description}
          </p>
        </div>

        {/* Stats */}
        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <StatBox icon={Bot} label="Agents" value={String(dept.agents)} />
          <StatBox label="Today" value={dept.tasksToday.toLocaleString()} />
        </div>

        {/* Health */}
        <div className="relative mt-4">
          <div className="flex items-center justify-between text-[11px] text-ink-400">
            <span className="uppercase tracking-[0.08em]">{dept.metric.label}</span>
            <span className="flex items-center gap-1 font-medium text-ink-200">
              <span className="tabular-nums text-[12.5px] text-white">{dept.metric.value}</span>
              <span className={cn(
                "tabular-nums text-[11px]",
                dept.metric.positive ? "text-emerald-300" : "text-rose-300"
              )}>
                {dept.metric.delta}
              </span>
            </span>
          </div>
          <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${dept.health}%` } : { width: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.25 + index * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative h-full rounded-full",
                dept.health >= 90 && "bg-gradient-to-r from-emerald-400 to-emerald-500",
                dept.health >= 75 && dept.health < 90 && "bg-gradient-to-r from-brand-400 to-cyan-400",
                dept.health < 75 && "bg-gradient-to-r from-amber-400 to-amber-500"
              )}
            >
              {dept.health >= 85 && !prefersReduced && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 right-0 w-8"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6))",
                    animation: "shimmer 2.4s ease-in-out infinite",
                  }}
                />
              )}
            </motion.div>
          </div>
        </div>

        <motion.button
          onClick={openDepartment}
          whileHover={prefersReduced ? undefined : { y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group/btn relative mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 text-[12.5px] font-medium text-ink-200 transition-all hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
        >
          Open {dept.name}
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" strokeWidth={2.2} />
        </motion.button>
        <style>{`
          @keyframes shimmer {
            0%   { transform: translateX(-100%); opacity: 0; }
            10%  { opacity: 1; }
            100% { transform: translateX(400%); opacity: 0; }
          }
        `}</style>
      </GlassCard>
    </motion.div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-500">
        {Icon && <Icon className="h-2.5 w-2.5" strokeWidth={2.4} />} {label}
      </div>
      <div className="mt-0.5 text-[13.5px] font-semibold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}
