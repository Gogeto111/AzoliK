import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { workforceEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { cn } from "@/lib/utils";
import { GitBranch, ArrowRight } from "lucide-react";

/**
 * Multi-agent collaboration visualization.
 * Shows active handoffs as animated arrows between department nodes.
 */
export function CollaborationView() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 800);
    return () => window.clearInterval(id);
  }, []);

  const handoffs = workforceEngine.state.handoffs.slice(0, 5);
  const tasks = workforceEngine.state.activeTasks.slice(0, 4);

  const deptById = React.useMemo(() => {
    const m: Record<string, typeof DEPARTMENTS[number]> = {};
    DEPARTMENTS.forEach((d) => (m[d.id] = d));
    return m;
  }, []);

  const nodePositions: Record<string, { x: number; y: number }> = {
    support: { x: 10, y: 50 },
    sales: { x: 40, y: 25 },
    marketing: { x: 75, y: 15 },
    operations: { x: 70, y: 75 },
    finance: { x: 40, y: 80 },
    hr: { x: 90, y: 55 },
  };

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Collaboration</h3>
            <Badge tone="brand" dot>Real-time</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">Watch departments hand work off to each other</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-ink-400">
          <GitBranch className="h-3 w-3" />
          {handoffs.length} handoffs
        </div>
      </div>

      {/* SVG Collaboration Map */}
      <div className="relative h-[220px] w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.6)" />
            </marker>
            <linearGradient id="handoff-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(143,174,255,0)" />
              <stop offset="50%" stopColor="rgba(143,174,255,0.9)" />
              <stop offset="100%" stopColor="rgba(143,174,255,0)" />
            </linearGradient>
          </defs>
          {/* Static connection lines */}
          {DEPARTMENTS.map((d) =>
            DEPARTMENTS.filter((o) => o.id !== d.id).slice(0, 2).map((o) => (
              <line
                key={`${d.id}-${o.id}`}
                x1={nodePositions[d.id].x} y1={nodePositions[d.id].y}
                x2={nodePositions[o.id].x} y2={nodePositions[o.id].y}
                stroke="rgba(255,255,255,0.04)" strokeWidth="0.15"
              />
            ))
          )}
          {/* Animated handoff lines */}
          <AnimatePresence>
            {handoffs.map((h) => {
              const a = nodePositions[h.from];
              const b = nodePositions[h.to];
              if (!a || !b) return null;
              const isActive = h.status === "in_progress";
              return (
                <motion.g key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={deptById[h.to].color.primary} strokeWidth="0.3" strokeOpacity="0.8"
                    markerEnd="url(#arrow)"
                  />
                  {isActive && (
                    <motion.circle
                      r="0.9" fill={deptById[h.to].color.primary}
                      initial={{ cx: a.x, cy: a.y }}
                      animate={{ cx: b.x, cy: b.y }}
                      transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                      style={{ filter: `drop-shadow(0 0 2px ${deptById[h.to].color.glow})` }}
                    />
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Department nodes */}
        {DEPARTMENTS.map((d) => {
          const pos = nodePositions[d.id];
          const active = tasks.some((t) => t.department === d.id);
          return (
            <motion.div
              key={d.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10 transition-all",
                  d.color.bg,
                  active && "scale-110"
                )}
                style={active ? { boxShadow: `0 0 16px ${d.color.glow}` } : undefined}
              >
                <d.icon className={cn("h-4 w-4", d.color.text)} strokeWidth={2} />
              </div>
              <div className="mt-1 text-center text-[9.5px] font-medium text-ink-300">{d.name}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Active tasks list */}
      <div className="border-t border-white/[0.06] px-5 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">Active workflows</div>
        <div className="space-y-1.5">
          {tasks.length === 0 && <div className="text-[11.5px] italic text-ink-500">Waiting for new tasks…</div>}
          {tasks.map((t) => {
            const dept = deptById[t.department];
            return (
              <div key={t.id} className="flex items-center gap-2 text-[12px]">
                <div className={cn("flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br", dept.color.bg)}>
                  <dept.icon className={cn("h-3 w-3", dept.color.text)} strokeWidth={2} />
                </div>
                <span className="flex-1 truncate text-ink-200">{t.title}</span>
                <span className="tabular-nums text-[10.5px] text-ink-400">{t.progress}%</span>
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: dept.color.primary, width: `${t.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <ArrowRight className="h-3 w-3 text-ink-500" />
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
