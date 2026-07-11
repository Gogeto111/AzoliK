import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { workforceEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { cn } from "@/lib/utils";
import {
  Brain,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRightLeft,
  Wrench,
  Sparkles,
  ChevronRight,
} from "lucide-react";

type RenderedStep = {
  kind: "think" | "tool" | "handoff" | "done";
  label: string;
  detail?: string;
  state: "pending" | "active" | "complete" | "error";
  meta?: Record<string, unknown>;
};

function useEngineFrame() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 600);
    return () => window.clearInterval(id);
  }, []);
}

/**
 * Live Task Execution panel. Replaces generic spinners by visualizing
 * the reasoning steps, tool calls, and handoffs of the top currently
 * running task. The engine currently simulates steps; we re-derive the
 * visual timeline from live toolCalls + handoffs so the UI is honest
 * about what has actually happened.
 */
export function TaskExecutions() {
  useEngineFrame();
  const depts = React.useMemo(
    () => Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d])),
    []
  );

  const tasks = workforceEngine.state.activeTasks
    .filter((t) => t.status !== "completed")
    .slice(0, 3);
  const primary = tasks[0];

  const steps: RenderedStep[] = React.useMemo(() => {
    if (!primary) return [];
    const out: RenderedStep[] = [];
    const toolCalls = workforceEngine.state.toolCalls.filter((tc) =>
      primary.toolCalls.includes(tc.id)
    );
    const handoffs = workforceEngine.state.handoffs.filter((h) =>
      primary.handoffs.includes(h.id)
    );

    out.push({
      kind: "think",
      label: "Understanding request",
      detail: primary.title,
      state: "complete",
    });

    toolCalls.forEach((tc) => {
      out.push({
        kind: "tool",
        label: tc.toolName,
        detail:
          tc.status === "running"
            ? "Calling tool…"
            : tc.status === "error"
            ? tc.error ?? "Retrying"
            : "Completed",
        state:
          tc.status === "running"
            ? "active"
            : tc.status === "error"
            ? "error"
            : "complete",
        meta: { dept: tc.department },
      });
    });

    handoffs.forEach((h) => {
      out.push({
        kind: "handoff",
        label: `${depts[h.from]?.name ?? h.from} → ${depts[h.to]?.name ?? h.to}`,
        detail: h.task,
        state: h.status === "completed" ? "complete" : "active",
        meta: { to: h.to },
      });
    });

    if (primary.status === "running" && toolCalls.length === 0 && handoffs.length === 0) {
      out.push({
        kind: "think",
        label: "Planning execution",
        detail: "Routing to the right agent",
        state: "active",
      });
    }

    if (primary.status === "completed") {
      out.push({
        kind: "done",
        label: "Task complete",
        detail: "Workforce archived the result",
        state: "complete",
      });
    } else if (out.length > 0) {
      // Mark the most recent active step
      const last = out[out.length - 1];
      if (last.state === "complete") {
        out.push({
          kind: "think",
          label: "Finalizing response",
          detail: "Writing back to the operator",
          state: "pending",
        });
      }
    }
    return out;
  }, [primary, depts]);

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-brand-200 ring-1 ring-inset ring-white/10">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-white">Live Execution</h3>
              {primary ? (
                <Badge tone="emerald" dot pulse>
                  Thinking
                </Badge>
              ) : (
                <Badge tone="muted">Idle</Badge>
              )}
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              Reasoning steps, tool calls, and handoffs — rendered as they happen
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        {!primary ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center">
            <Sparkles className="h-5 w-5 text-ink-400" />
            <p className="mt-2 text-[12.5px] text-ink-300">
              No tasks executing right now.
            </p>
            <p className="mt-1 text-[11px] text-ink-500">
              Ask Azolik to do something to watch a full multi-agent run.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <PrimaryTaskCard task={primary} dept={depts[primary.department]} />

            <ol className="relative ml-2 space-y-2.5">
              <span
                aria-hidden
                className="absolute left-[15px] top-1 bottom-1 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent"
              />
              <AnimatePresence initial={false}>
                {steps.map((s, i) => (
                  <StepRow key={`${primary.id}-${i}-${s.label}`} step={s} index={i} depts={depts} />
                ))}
              </AnimatePresence>
            </ol>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PrimaryTaskCard({
  task,
  dept,
}: {
  task: { title: string; department: string; assignee: string; status: string; progress: number };
  dept: (typeof DEPARTMENTS)[number];
}) {
  const DeptIcon = dept.icon;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
              dept.color.bg
            )}
          >
            <DeptIcon className={cn("h-4 w-4", dept.color.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-white">
              {task.title}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-400">
              <span className={dept.color.text}>{dept.name}</span>
              <span>·</span>
              <span>{task.assignee}</span>
              <span>·</span>
              <span className="capitalize">{task.status.replace("_", " ")}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="tabular-nums text-[13px] font-semibold text-white">
              {task.progress}%
            </div>
            <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: dept.color.primary }}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>
  );
}

function StepRow({
  step,
  depts,
}: {
  step: RenderedStep;
  index: number;
  depts: Record<string, (typeof DEPARTMENTS)[number]>;
}) {
  const Icon =
    step.kind === "tool"
      ? Wrench
      : step.kind === "handoff"
      ? ArrowRightLeft
      : step.kind === "done"
      ? CheckCircle2
      : Brain;

  const ringColor =
    step.state === "active"
      ? "ring-brand-400/40 bg-brand-500/15 text-brand-200"
      : step.state === "error"
      ? "ring-amber-400/40 bg-amber-500/15 text-amber-200"
      : step.state === "complete"
      ? "ring-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      : "ring-white/10 bg-white/[0.03] text-ink-400";

  const targetDept =
    step.kind === "handoff" && step.meta?.to
      ? depts[step.meta.to as string]
      : step.kind === "tool" && step.meta?.dept
      ? depts[step.meta.dept as string]
      : null;

  const DeptIcon = targetDept?.icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -6, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="relative flex items-start gap-3 pl-8"
    >
      <span
        className={cn(
          "absolute left-0 top-0.5 flex h-[30px] w-[30px] items-center justify-center rounded-full ring-1 ring-inset",
          ringColor
        )}
      >
        {step.state === "active" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-3.5 w-3.5" />
          </motion.div>
        ) : step.state === "error" ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[12.5px] font-medium",
              step.state === "pending" ? "text-ink-400" : "text-white"
            )}
          >
            {step.label}
          </span>
          {targetDept && DeptIcon && (
            <Badge tone="muted" className="!py-0 !px-1.5 !text-[9px]">
              <DeptIcon className="mr-1 inline h-2.5 w-2.5" />
              {targetDept.name}
            </Badge>
          )}
          {step.state === "active" && (
            <span className="text-[10px] uppercase tracking-widest text-brand-300">
              · in progress
            </span>
          )}
        </div>
        {step.detail && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-400">
            <ChevronRight className="h-3 w-3 text-ink-500" />
            <span className="truncate">{step.detail}</span>
          </div>
        )}
      </div>
    </motion.li>
  );
}
