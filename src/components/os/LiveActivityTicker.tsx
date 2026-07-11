import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAI, type ActivityItem } from "@/lib/aiStore";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
  Brain,
  Bot,
  Activity,
} from "lucide-react";

const levelMeta = {
  success: { icon: CheckCircle2, color: "text-emerald-300 bg-emerald-500/10 ring-emerald-400/20" },
  info: { icon: Info, color: "text-brand-300 bg-brand-500/10 ring-brand-400/20" },
  warning: { icon: AlertTriangle, color: "text-amber-300 bg-amber-500/10 ring-amber-400/20" },
  error: { icon: XCircle, color: "text-rose-300 bg-rose-500/10 ring-rose-400/20" },
  reasoning: { icon: Brain, color: "text-violet-300 bg-violet-500/10 ring-violet-400/20" },
  thinking: { icon: Loader2, color: "text-brand-300 bg-brand-500/10 ring-brand-400/20" },
  task: { icon: Bot, color: "text-cyan-300 bg-cyan-500/10 ring-cyan-400/20" },
};

const toneDot = {
  brand: "bg-brand-400",
  violet: "bg-violet-400",
  cyan: "bg-cyan-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

export function LiveActivityTicker({ compact = false }: { compact?: boolean }) {
  const ai = useAI();
  const items = ai.activity.slice(0, compact ? 5 : 12);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
        </span>
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-300">
          Live activity
        </h3>
        <span className="ml-auto flex items-center gap-1 text-[10.5px] text-ink-500">
          <Activity className="h-3 w-3" />
          real-time
        </span>
      </div>
      <div className="relative mt-3">
        <div className="pointer-events-none absolute left-[11px] top-1 bottom-1 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
        <div className="space-y-0.5">
          <AnimatePresence initial={false}>
            {items.length === 0 && (
              <div className="py-4 text-center text-[11.5px] text-ink-500">
                Waiting for activity…
              </div>
            )}
            {items.map((it) => (
              <ActivityRow key={it.id} item={it} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = levelMeta[item.level];
  const Icon = meta.icon;
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 5000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group flex items-start gap-2.5 overflow-hidden py-1.5"
    >
      <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg ring-1 ring-inset", meta.color)}>
          <Icon className={cn("h-3 w-3", item.level === "thinking" && "animate-spin")} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-100">
          <span className="truncate">{item.message}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-ink-500">
          <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[item.deptTone])} />
          <span className="font-medium text-ink-400">{item.dept}</span>
          <span className="text-ink-600">·</span>
          <span>{item.agent}</span>
          <span className="ml-auto">{timeAgo(item.at)}</span>
        </div>
        {typeof item.progress === "number" && (
          <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-cyan-400"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
