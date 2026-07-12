import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { softSpring, snappySpring } from "@/lib/motion";
import {
  Bot, Wrench, Activity, Brain, Clock, CheckCircle2, ArrowRight,
  MessageSquare, Briefcase, Calculator, Settings2,
} from "lucide-react";
import type { DepartmentId } from "@/types";

const CORE_DEPTS: DepartmentId[] = ["support", "sales", "finance", "operations"];

const DEPT_ICONS: Record<DepartmentId, any> = {
  support: MessageSquare,
  sales: Briefcase,
  finance: Calculator,
  operations: Settings2,
  marketing: Bot,
  hr: Bot,
};

const DEPT_GLOW: Record<DepartmentId, string> = {
  support: "rgba(34,211,238,0.4)",
  sales: "rgba(52,211,153,0.4)",
  finance: "rgba(251,113,133,0.4)",
  operations: "rgba(251,191,36,0.4)",
  marketing: "rgba(167,139,250,0.4)",
  hr: "rgba(143,174,255,0.4)",
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: snappySpring },
};

export default function Departments() {
  const engine = useEngine();

  return (
    <motion.div
      className="space-y-6 pb-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={cardVariant}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-white">Departments</h1>
            <p className="mt-1 text-[13px] text-ink-400">
              Your AI employees — specialized teams handling real work autonomously.
            </p>
          </div>
          <Badge tone="emerald" dot pulse>
            {CORE_DEPTS.filter((id) => engine.departmentStatus[id]?.tone === "working").length} of {CORE_DEPTS.length} active
          </Badge>
        </div>
      </motion.div>

      {/* Department Cards — large employee-style */}
      <div className="grid gap-5 lg:grid-cols-2">
        {CORE_DEPTS.map((id, i) => (
          <motion.div key={id} variants={cardVariant}>
            <DepartmentEmployeeCard deptId={id} engine={engine} index={i} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DepartmentEmployeeCard({
  deptId,
  engine,
  index,
}: {
  deptId: DepartmentId;
  engine: ReturnType<typeof useEngine>;
  index: number;
}) {
  const dept = DEPARTMENTS.find((d) => d.id === deptId)!;
  const status = engine.departmentStatus[deptId];
  const Icon = DEPT_ICONS[deptId];
  const isWorking = status.tone === "working";
  const isHandoff = status.tone === "handoff";
  const isDone = status.tone === "done";

  // Find latest tool call for this dept
  const latestToolCall = engine.toolCalls.find((tc) => tc.department === deptId);
  // Find latest handoff involving this dept
  const latestHandoff = engine.handoffs.find(
    (h) => h.from === deptId || h.to === deptId
  );
  // Active task for this dept
  const activeTask = engine.activeTasks.find((t) => t.department === deptId);

  return (
    <GlassCard className="relative overflow-hidden p-0" tilt={false} interactive={false}>
      {/* Glow effect */}
      <AnimatePresence>
        {isWorking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 20% 50%, ${DEPT_GLOW[deptId]}, transparent 70%)`,
              filter: "blur(20px)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative p-6">
        {/* Top Row: Avatar + Name + Status */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative">
            <motion.div
              animate={isWorking ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={isWorking ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/15"
              style={{
                background: `linear-gradient(135deg, ${dept.color.primary}33, ${dept.color.primary}11)`,
              }}
            >
              {isWorking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Bot className="h-7 w-7" style={{ color: dept.color.primary }} strokeWidth={1.9} />
                </motion.div>
              ) : (
                <Bot className="h-7 w-7" style={{ color: dept.color.primary }} strokeWidth={1.9} />
              )}
              {isWorking && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -inset-0.5 rounded-2xl"
                  style={{ boxShadow: `0 0 20px ${dept.color.glow}` }}
                />
              )}
            </motion.div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
              {isWorking && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: dept.color.primary }} />
              )}
              <span
                className="relative inline-flex h-4 w-4 rounded-full ring-2 ring-ink-950"
                style={{ background: isWorking ? dept.color.primary : isDone ? "#34d399" : "#555" }}
              />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{dept.personName}</h3>
              <span className="text-[13px] text-ink-400">· {dept.personRole}</span>
            </div>
            <p className="text-[12px] text-ink-400 mt-0.5">{dept.tagline}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                tone={isWorking ? "cyan" : isDone ? "emerald" : isHandoff ? "amber" : "muted"}
                dot
                pulse={isWorking}
                size="xs"
              >
                {isWorking ? "Thinking..." : isDone ? "Task complete" : isHandoff ? "Handoff" : "On standby"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Current Task */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status.line}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={softSpring}
            className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="h-3 w-3 text-ink-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Current Task</span>
            </div>
            <p className="text-[13px] text-white font-medium">{status.line}</p>
          </motion.div>
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatPill
            icon={CheckCircle2}
            label="Completed Today"
            value={String(status.completedTasksToday)}
            color="text-emerald-400"
          />
          <StatPill
            icon={Clock}
            label="Avg Response"
            value={dept.stats?.avgResponseTime || "1.8s"}
            color="text-amber-400"
          />
          <StatPill
            icon={Activity}
            label="Success Rate"
            value={`${dept.stats?.successRate || 95}%`}
            color="text-cyan-400"
          />
        </div>

        {/* Tool Currently Using */}
        <AnimatePresence mode="wait">
          {latestToolCall && latestToolCall.status === "running" ? (
            <motion.div
              key={latestToolCall.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={softSpring}
              className="mb-4"
            >
              <div className="flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Wrench className="h-3.5 w-3.5 text-brand-400" />
                </motion.div>
                <span className="text-[12px] text-brand-200 font-medium">
                  Using {latestToolCall.toolName}
                </span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Confidence / Queue */}
        <div className="flex items-center gap-3 text-[11px] text-ink-400">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3 w-3" />
            <span>Confidence: {Math.round(0.92 * 100)}%</span>
          </div>
          <span className="text-ink-700">·</span>
          <div className="flex items-center gap-1.5">
            <span>Queue: {engine.activeTasks.filter((t) => t.department === deptId).length} tasks</span>
          </div>
          <span className="text-ink-700">·</span>
          <div className="flex items-center gap-1.5">
            <span>{dept.agents.filter((a) => a.status === "active").length} agents online</span>
          </div>
        </div>

        {/* Agents */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-2">
            {dept.agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1"
              >
                <span
                  className="relative flex h-1.5 w-1.5"
                >
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${agent.status === "active" ? "animate-ping" : ""}`} style={{ background: agent.status === "active" ? dept.color.primary : "#555" }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: agent.status === "active" ? dept.color.primary : "#555" }} />
                </span>
                <span className="text-[10px] text-ink-300 font-medium">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[12px] font-semibold tabular-nums text-white">{value}</div>
        <div className="truncate text-[9px] uppercase tracking-wider text-ink-500">{label}</div>
      </div>
    </div>
  );
}
