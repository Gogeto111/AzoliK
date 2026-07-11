import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  ThumbsUp,
  X,
} from "lucide-react";

const ICONS = {
  approval: ThumbsUp,
  anomaly: AlertTriangle,
  expiring: Clock,
  vip: Crown,
} as const;

const TONE: Record<string, { ring: string; bg: string; text: string; badge: "amber" | "rose" | "brand" | "cyan" }> = {
  urgent: { ring: "ring-rose-400/30", bg: "bg-rose-500/10", text: "text-rose-200", badge: "rose" },
  warn: { ring: "ring-amber-400/30", bg: "bg-amber-500/10", text: "text-amber-200", badge: "amber" },
  info: { ring: "ring-cyan-400/30", bg: "bg-cyan-500/10", text: "text-cyan-200", badge: "cyan" },
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function AttentionFeed() {
  const state = useEngine();
  const depts = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 15000);
    return () => window.clearInterval(id);
  }, []);

  const dismiss = (id: string) => {
    state.attention = state.attention.filter((a) => a.id !== id);
    // Listeners will emit on next tick; force emit
    (state as any); // keep reference
    (window as any).dispatchEvent(new Event("azolik:attention"));
  };

  const items = state.attention.slice(0, 5);

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Needs your attention</h3>
            {items.length > 0 && (
              <Badge tone="amber" dot pulse>
                {items.length} items
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Your workforce only interrupts you for approvals and anomalies.
          </p>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-4">
        <AnimatePresence initial={false}>
          {items.length === 0 && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-6 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-300" />
              <p className="mt-2 text-[13px] font-medium text-emerald-100">
                All clear — nothing needs you right now.
              </p>
              <p className="mt-0.5 text-[11.5px] text-emerald-300/70">
                Your departments are handling everything.
              </p>
            </div>
          )}
          {items.map((a) => {
            const Icon = ICONS[a.kind];
            const tone = TONE[a.severity];
            const dept = depts[a.department];
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border bg-white/[0.02] p-3 ring-1 ring-inset",
                  tone.ring
                )}
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone.bg, tone.text)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white">{a.title}</span>
                    <Badge tone={tone.badge} className="!text-[9.5px]">{a.kind}</Badge>
                    <span className="ml-auto text-[10px] tabular-nums text-ink-500">{timeAgo(a.at)}</span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-300">{a.detail}</div>
                  {dept && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px]">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: dept.color.primary }}
                      />
                      <span className={dept.color.text}>{dept.name} Department</span>
                      <span className="text-ink-500">waiting on you</span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="primary" className="h-7 !px-2 text-[11px]">Approve</Button>
                  <button
                    onClick={() => dismiss(a.id)}
                    className="flex h-6 items-center justify-center rounded-md text-[10.5px] text-ink-400 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-3 w-3" /> Dismiss
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
