import { useRef } from "react";
import { motion } from "framer-motion";
import { useEngine, useEngineStart } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { snappySpring } from "@/lib/motion";
import type { DepartmentId } from "@/types";
import {
  IndianRupee, Target, Users, Clock, Zap,
  Loader2, Check, Bot, Wrench,
} from "lucide-react";

const deptConfigMap = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));

const DEPT_ORDER: DepartmentId[] = ["support", "sales", "finance", "operations"];

function deptBadgeTone(id: DepartmentId): "cyan" | "emerald" | "violet" | "rose" | "amber" | "brand" {
  switch (id) {
    case "support": return "cyan";
    case "sales": return "emerald";
    case "marketing": return "violet";
    case "finance": return "rose";
    case "operations": return "amber";
    case "hr": return "brand";
  }
}

function deptToneBadge(tone: "idle" | "working" | "handoff" | "done") {
  switch (tone) {
    case "working": return { tone: "cyan" as const, label: "Working" };
    case "handoff": return { tone: "amber" as const, label: "Handoff" };
    case "done": return { tone: "emerald" as const, label: "Done" };
    default: return { tone: "muted" as const, label: "Idle" };
  }
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: snappySpring },
};

export default function Dashboard() {
  useEngineStart();
  const engine = useEngine();

  const m = engine.metrics;
  const activeTask = engine.activeTasks[0];
  const activeToolCalls = activeTask
    ? engine.toolCalls.filter((tc) => activeTask.toolCalls.includes(tc.id))
    : [];

  return (
    <motion.div
      className="space-y-6 pb-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariant} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            Mission Control
          </h1>
          <p className="mt-1 text-[13px] text-ink-400">
            {engine.businessName} — Your AI workforce in action
          </p>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <motion.div variants={itemVariant} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {([
          { label: "Revenue Generated", value: `₹${m.revenueGenerated.toLocaleString()}`, icon: IndianRupee },
          { label: "Leads Closed", value: m.leadsClosed.toLocaleString(), icon: Target },
          { label: "Customers Helped", value: m.customersHelped.toLocaleString(), icon: Users },
          { label: "Hours Saved", value: `${Math.round(m.hoursSaved)}h`, icon: Clock },
          { label: "Automations", value: m.automationsCompleted.toLocaleString(), icon: Zap },
        ] as const).map((kpi, i) => (
          <GlassCard key={i} tone="subtle">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] ring-1 ring-inset ring-white/10">
                <kpi.icon className="h-5 w-5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-ink-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-semibold text-white">{kpi.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Department Status Grid */}
      <motion.div variants={itemVariant} className="grid gap-4 sm:grid-cols-2">
        {DEPT_ORDER.map((id) => {
          const dept = deptConfigMap[id];
          const status = engine.departmentStatus[id];
          const badge = deptToneBadge(status.tone);
          const Icon = dept?.icon;
          return (
            <GlassCard key={id}>
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/10"
                  style={{ boxShadow: `0 0 20px ${dept?.color?.glow ?? "transparent"}` }}
                >
                  {Icon && <Icon className="h-5 w-5" style={{ color: dept.color.primary }} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-white text-sm truncate">{dept?.personName || dept?.name}</h3>
                    <Badge tone={badge.tone} dot pulse={status.tone === "working"} size="xs">{badge.label}</Badge>
                  </div>
                  <p className="text-xs text-ink-400 mt-1 truncate">{status.line}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-ink-500">{dept?.personRole || `${dept?.name} Lead`}</span>
                    <span className="text-ink-700">·</span>
                    <span className="text-[10px] text-ink-500">
                      {dept?.agents?.filter((a) => a.status === "active").length ?? 0} agents online
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </motion.div>

      {/* Live Execution + Tool Calls */}
      <motion.div variants={itemVariant} className="grid gap-4 lg:grid-cols-5">
        {/* Live Execution Panel */}
        <GlassCard className="lg:col-span-2" noPadding>
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Live Execution</h2>
              {activeTask && <Badge tone="cyan" size="xs" dot pulse>Running</Badge>}
            </div>
            {activeTask ? (
              <div className="mt-1">
                <p className="text-xs text-ink-300 truncate">{activeTask.title}</p>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${activeTask.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-ink-500">
                    {activeTask.assignee} · {deptConfigMap[activeTask.department]?.name}
                  </span>
                  <span className="text-[10px] text-ink-500">{activeTask.progress}%</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-500 mt-1">No active tasks</p>
            )}
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {activeToolCalls.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/[0.06]" />
                <div className="space-y-3">
                  {activeToolCalls.map((tc) => (
                    <div key={tc.id} className="relative flex items-start gap-3">
                      <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-950 ring-1 ring-inset ring-white/10">
                        {tc.status === "running" ? (
                          <Loader2 className="h-3 w-3 text-brand-400 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-xs text-white truncate">{tc.toolName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge tone={deptBadgeTone(tc.department)} size="xs">
                            {deptConfigMap[tc.department]?.name}
                          </Badge>
                          {tc.duration != null && (
                            <span className="text-[10px] text-ink-500">{Math.round(tc.duration)}ms</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTask ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                <p className="text-xs text-ink-500 mt-2">Executing steps...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Bot className="h-8 w-8 text-ink-600" />
                <p className="text-xs text-ink-500 mt-2">Waiting for incoming work</p>
                <p className="text-[10px] text-ink-600 mt-1">Customer messages will appear here</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Tool Calls Feed */}
        <GlassCard className="lg:col-span-3" noPadding>
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Tool Calls</h2>
              <Badge tone="muted" size="xs">{engine.toolCalls.length} total</Badge>
            </div>
            <p className="text-[11px] text-ink-500 mt-0.5">Real-time activity across all departments</p>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
            {engine.toolCalls.slice(0, 15).map((tc) => (
              <div key={tc.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]">
                  {tc.status === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 text-brand-400 animate-spin" />
                  ) : (
                    <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white truncate">{tc.toolName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge tone={deptBadgeTone(tc.department)} size="xs">
                      {deptConfigMap[tc.department]?.name}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge tone={tc.status === "running" ? "brand" : "emerald"} size="xs">
                    {tc.status === "running" ? "Running" : "Done"}
                  </Badge>
                  {tc.duration != null && (
                    <p className="text-[10px] text-ink-500 mt-0.5">{Math.round(tc.duration)}ms</p>
                  )}
                </div>
              </div>
            ))}
            {engine.toolCalls.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <Wrench className="h-6 w-6 text-ink-600" />
                <p className="text-xs text-ink-500 mt-2">No tool calls yet</p>
                <p className="text-[10px] text-ink-600 mt-1">They'll stream in as work happens</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Inbox */}
      {engine.inbox.length > 0 && (
        <motion.div variants={itemVariant} className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Recent Customer Messages</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {engine.inbox.slice(0, 4).map((msg) => (
              <GlassCard key={msg.id} interactive>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-inset ring-white/[0.06]">
                    <Users className="h-3.5 w-3.5 text-ink-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">{msg.customer.name}</p>
                    <p className="text-[11px] text-ink-400 truncate">{msg.text}</p>
                  </div>
                  <Badge tone="cyan" size="xs">{msg.customer.channel}</Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
