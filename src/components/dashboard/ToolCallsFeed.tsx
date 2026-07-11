import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { workforceEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Zap, AlertTriangle } from "lucide-react";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

export function ToolCallsFeed() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 1200);
    return () => window.clearInterval(id);
  }, []);

  const calls = workforceEngine.state.toolCalls.slice(0, 10);
  const depts = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-center justify-between p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Live Tool Calls</h3>
            <Badge tone="emerald" dot pulse>Executing</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">Every tool the AI workforce is using right now</p>
        </div>
      </div>
      <div className="max-h-[360px] space-y-0.5 overflow-y-auto px-2 pb-3">
        <AnimatePresence initial={false}>
          {calls.length === 0 && (
            <div className="px-4 py-8 text-center text-[12px] italic text-ink-500">
              Waiting for AI workers…
            </div>
          )}
          {calls.map((c) => {
            const dept = depts[c.department];
            const running = c.status === "running";
            const error = c.status === "error";
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, x: -8, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03]"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                    dept.color.bg
                  )}
                >
                  {running ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                      <Loader2 className={cn("h-4 w-4", dept.color.text)} />
                    </motion.div>
                  ) : error ? (
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[12.5px] font-medium text-white">
                      {c.toolName}
                    </span>
                    <Badge
                      tone={running ? "brand" : error ? "amber" : "emerald"}
                      className="!text-[9px]"
                    >
                      {running ? "running" : error ? "retrying" : "done"}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-ink-400">
                    <span className={cn("flex items-center gap-1", dept.color.text)}>
                      <span className="h-1 w-1 rounded-full" style={{ background: dept.color.primary }} />
                      {dept.name}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">{timeAgo(c.startedAt)}</span>
                    {c.duration && <>
                      <span>·</span>
                      <span className="tabular-nums">{Math.round(c.duration / 100) / 10}s</span>
                    </>}
                  </div>
                </div>
                {running && (
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: dept.color.primary }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="border-t border-white/[0.06] px-5 py-3">
        <div className="flex items-center justify-between text-[11px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-brand-300" />
            Tools execute in real-time — no hallucinations
          </span>
          <span>{workforceEngine.state.metrics.automationsCompleted.toLocaleString()} total</span>
        </div>
      </div>
    </GlassCard>
  );
}
