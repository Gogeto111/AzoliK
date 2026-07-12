import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEngine, workforceEngine } from "@/lib/engine";
import { softSpring, snappySpring } from "@/lib/motion";
import {
  Zap, GitBranch, Clock, Bot, ArrowRight,
  CheckCircle2, Circle, Play,
  MessageSquare, Search, Package, Table, CreditCard, Send,
  CakeSlice, CalendarDays, Dumbbell,
} from "lucide-react";

const WORKFLOWS = [
  {
    id: "order",
    title: "Customer Order Flow",
    desc: "Message → Knowledge → Inventory → Sales → Payment → Reply",
    icon: CakeSlice,
    color: "text-amber-300",
    bg: "from-amber-500/30 to-amber-700/10",
    steps: [
      { icon: MessageSquare, label: "Customer Message", dept: "Support", color: "#22d3ee" },
      { icon: Search, label: "Knowledge Search", dept: "Support", color: "#22d3ee" },
      { icon: Package, label: "Inventory Check", dept: "Operations", color: "#fbbf24" },
      { icon: Table, label: "Google Sheets", dept: "Finance", color: "#fb7185" },
      { icon: CreditCard, label: "Payment Link", dept: "Sales", color: "#34d399" },
      { icon: Send, label: "Reply Sent", dept: "Support", color: "#22d3ee" },
    ],
  },
  {
    id: "appointment",
    title: "Appointment Booking",
    desc: "Request → Calendar → Deposit → Invoice → Reminder → Confirm",
    icon: CalendarDays,
    color: "text-cyan-300",
    bg: "from-cyan-500/30 to-cyan-700/10",
    steps: [
      { icon: MessageSquare, label: "Booking Request", dept: "Support", color: "#22d3ee" },
      { icon: CalendarDays, label: "Check Availability", dept: "Sales", color: "#34d399" },
      { icon: CreditCard, label: "Deposit Link", dept: "Sales", color: "#34d399" },
      { icon: Table, label: "GST Invoice", dept: "Finance", color: "#fb7185" },
      { icon: Send, label: "Confirm to Customer", dept: "Support", color: "#22d3ee" },
    ],
  },
  {
    id: "lead",
    title: "Lead to Sale",
    desc: "Inquiry → Pricing → Trial → CRM → Welcome → Confirmation",
    icon: Dumbbell,
    color: "text-emerald-300",
    bg: "from-emerald-500/30 to-emerald-700/10",
    steps: [
      { icon: MessageSquare, label: "Price Inquiry", dept: "Support", color: "#22d3ee" },
      { icon: Search, label: "Pull Pricing", dept: "Support", color: "#22d3ee" },
      { icon: CalendarDays, label: "Book Trial", dept: "Sales", color: "#34d399" },
      { icon: CreditCard, label: "Trial Payment", dept: "Sales", color: "#34d399" },
      { icon: Send, label: "Confirmation", dept: "Support", color: "#22d3ee" },
    ],
  },
];

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: snappySpring },
};

export default function Automation() {
  const engine = useEngine();
  const [selectedFlow, setSelectedFlow] = React.useState<string | null>(null);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const id = window.setInterval(forceUpdate, 2000);
    return () => window.clearInterval(id);
  }, []);

  const activeRuns = engine.activeTasks.filter(
    (t) => t.status === "running" || t.status === "waiting_handoff"
  );

  const runFlow = (flowId: string) => {
    setSelectedFlow(flowId);
    if (flowId === "order") workforceEngine.runOrderFlow();
    else if (flowId === "appointment") workforceEngine.runAppointmentFlow();
    else if (flowId === "lead") workforceEngine.runLeadFlow();
  };

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
          <h1 className="text-[28px] font-semibold tracking-tight text-white">Automation</h1>
          <p className="mt-1 text-[13px] text-ink-400">
            Workflows that run your business — every step visible, no black boxes.
          </p>
        </div>
        <Badge tone={activeRuns.length ? "emerald" : "muted"} dot pulse={!!activeRuns.length}>
          {activeRuns.length} running
        </Badge>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariant} className="grid gap-4 md:grid-cols-3">
        <GlassCard tone="subtle">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-white/10">
              <Zap className="h-5 w-5 text-brand-200" />
            </div>
            <div>
              <div className="text-[12px] text-ink-400">Active workflows</div>
              <div className="text-[22px] font-semibold text-white">{activeRuns.length}</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard tone="subtle">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-700/10 ring-1 ring-inset ring-white/10">
              <GitBranch className="h-5 w-5 text-violet-200" />
            </div>
            <div>
              <div className="text-[12px] text-ink-400">Departments online</div>
              <div className="text-[22px] font-semibold text-white">4/4</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard tone="subtle">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/10 ring-1 ring-inset ring-white/10">
              <Clock className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-[12px] text-ink-400">Completed today</div>
              <div className="text-[22px] font-semibold text-white">{engine.metrics.automationsCompleted}</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Workflow Pipeline Display */}
      {selectedFlow ? (
        <motion.div variants={itemVariant}>
          <SelectedWorkflow
            workflow={WORKFLOWS.find((w) => w.id === selectedFlow)!}
            engine={engine}
            onBack={() => setSelectedFlow(null)}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariant} className="grid gap-4 md:grid-cols-3">
          {WORKFLOWS.map((wf, i) => {
            const Icon = wf.icon;
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 26 }}
              >
                <GlassCard className="flex flex-col h-full p-5 relative overflow-hidden" hoverLift={4}>
                  <div className="flex items-start justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${wf.bg}`}>
                      <Icon className={`h-5 w-5 ${wf.color}`} />
                    </div>
                  </div>
                  <h4 className="mt-4 text-[15px] font-semibold text-white">{wf.title}</h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-400">{wf.desc}</p>

                  {/* Step preview */}
                  <div className="mt-4 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {wf.steps.slice(0, 4).map((step, j) => (
                        <span key={j} className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10px] text-ink-300">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: step.color }} />
                          {step.label}
                        </span>
                      ))}
                      {wf.steps.length > 4 && (
                        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10px] text-ink-400">
                          +{wf.steps.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <Button size="sm" variant="primary" className="w-full gap-1.5" onClick={() => runFlow(wf.id)}>
                      <Play className="h-3.5 w-3.5" /> Run Workflow
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Live Runs */}
      {activeRuns.length > 0 && !selectedFlow && (
        <motion.div variants={itemVariant} className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-brand-300" />
            Active Runs
          </h2>
          {activeRuns.map((run) => (
            <GlassCard key={run.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20">
                    <Zap className="h-3.5 w-3.5 text-brand-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-white truncate">{run.title}</p>
                    <p className="text-[10px] text-ink-400">{run.department} · {run.assignee}</p>
                  </div>
                </div>
                <Badge tone="emerald" size="xs" dot>Running</Badge>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${run.progress}%` }}
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600"
                />
              </div>
            </GlassCard>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function SelectedWorkflow({
  workflow,
  engine,
  onBack,
}: {
  workflow: typeof WORKFLOWS[0];
  engine: ReturnType<typeof useEngine>;
  onBack: () => void;
}) {
  const activeTask = engine.activeTasks[0];
  const [animStep, setAnimStep] = React.useState(0);

  React.useEffect(() => {
    if (!activeTask) return;
    const interval = setInterval(() => {
      setAnimStep((s) => {
        const next = Math.floor((activeTask.progress / 100) * workflow.steps.length);
        return Math.min(next, workflow.steps.length - 1);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [activeTask, workflow.steps.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={onBack}>← Back</Button>
        <h2 className="text-[17px] font-semibold text-white">{workflow.title}</h2>
        {activeTask && <Badge tone="cyan" dot pulse>Running</Badge>}
      </div>

      {/* Pipeline visualization */}
      <GlassCard className="p-6" tilt={false}>
        <div className="space-y-0">
          {workflow.steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeTask && i === animStep;
            const isDone = activeTask && i < animStep;
            const isPending = !activeTask || i > animStep;

            return (
              <div key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4"
                >
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0 flex items-center justify-center w-10">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={isActive ? { duration: 1, repeat: Infinity } : undefined}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl ring-2 ring-ink-950 ${
                        isActive
                          ? "bg-gradient-to-br from-brand-500 to-brand-700"
                          : isDone
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                            : "bg-white/[0.04]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="h-5 w-5 text-white" />
                        </motion.div>
                      ) : (
                        <Icon className="h-5 w-5 text-ink-400" />
                      )}
                    </motion.div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className={`rounded-xl border p-4 transition-all ${
                      isActive
                        ? "border-brand-500/30 bg-brand-500/5"
                        : isDone
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-white/[0.06] bg-white/[0.02]"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-white">{step.label}</span>
                        </div>
                        <Badge
                          tone={isDone ? "emerald" : isActive ? "cyan" : "muted"}
                          size="xs"
                          dot={isActive}
                          pulse={isActive}
                        >
                          {isDone ? "Done" : isActive ? "Running" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: step.color }} />
                          {step.dept}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Connector */}
                {i < workflow.steps.length - 1 && (
                  <div className="flex items-center justify-start ml-[19px] h-4">
                    <div className={`w-0.5 h-full ${isDone ? "bg-emerald-500/40" : "bg-white/10"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
