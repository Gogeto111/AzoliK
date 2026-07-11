import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TaskExecutions } from "@/components/dashboard/TaskExecutions";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { ToolCallsFeed } from "@/components/dashboard/ToolCallsFeed";
import { useEngine, workforceEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import {
  Workflow,
  Plus,
  Zap,
  GitBranch,
  Clock,
  ArrowUpRight,
  Play,
  Bot,
  CakeSlice,
  Calendar as CalendarIcon,
  Dumbbell,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PRESETS = [
  {
    id: "order",
    title: "Bakery · Cake inquiry",
    desc: '"Do you have chocolate cake?" → full order flow',
    icon: CakeSlice,
    run: () => workforceEngine.runOrderFlow(),
    tone: "cyan" as const,
  },
  {
    id: "appointment",
    title: "Dental · Book appointment",
    desc: '"Doctor free tomorrow?" → slot + deposit + reminder',
    icon: CalendarIcon,
    run: () => workforceEngine.runAppointmentFlow(),
    tone: "violet" as const,
  },
  {
    id: "lead",
    title: "Gym · Fees inquiry",
    desc: '"Fees kitni hai?" → pricing + trial booked',
    icon: Dumbbell,
    run: () => workforceEngine.runLeadFlow(),
    tone: "emerald" as const,
  },
];

export default function Automation() {
  useEngine();
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 1500);
    return () => window.clearInterval(id);
  }, []);

  const m = workforceEngine.state.metrics;
  const active = workforceEngine.state.activeTasks.filter(
    (t) => t.status !== "completed"
  ).length;

  return (
    <div>
      <PageHeader
        title="Automation"
        description="Watch your AI workforce execute multi-step workflows live. Triggers, handoffs, and tool calls — all visible, no spinners."
        badge={{ label: active ? `${active} running` : "Idle", tone: active ? "emerald" : "muted", dot: !!active }}
        actions={
          <>
            <Button size="md" variant="glass">Templates</Button>
            <Button size="md" variant="primary">
              <Plus className="h-4 w-4" /> New Workflow
            </Button>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatTile icon={Zap} label="Active workflows" value={String(active)} delta={`${m.automationsCompleted.toLocaleString("en-IN")} total`} tone="brand" />
        <StatTile icon={GitBranch} label="Departments online" value={`${DEPARTMENTS.length}/6`} delta="Cross-team routing on" tone="violet" />
        <StatTile icon={Clock} label="Saved this month" value={`${Math.round(m.hoursSaved)}h`} delta="~12h / day" tone="emerald" />
      </div>

      {/* Quick-run presets */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PRESETS.map((p) => {
          const Ico = p.icon;
          return (
            <button
              key={p.id}
              onClick={p.run}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                    p.tone === "cyan" && "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
                    p.tone === "emerald" && "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
                    p.tone === "violet" && "from-violet-500/30 to-violet-700/10 text-violet-200",
                  )}
                >
                  <Ico className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white">{p.title}</span>
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-ink-300">
                      Demo
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-400">{p.desc}</div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-ink-300 transition-all group-hover:bg-gradient-to-b group-hover:from-brand-400 group-hover:to-brand-600 group-hover:text-white">
                  <Play className="h-3 w-3" fill="currentColor" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 26 }}
        className="mt-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-white">
              <Workflow className="h-4 w-4 text-brand-300" />
              Live Workflow Canvas
            </h2>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              Nodes light up as agents and tools execute. Watch work move between departments in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={active ? "emerald" : "muted"} dot={!!active}>
              <Bot className="h-3 w-3" /> {active ? `${active} workflows executing` : "Waiting"}
            </Badge>
          </div>
        </div>
        <WorkflowCanvas />
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <TaskExecutions />
        <ToolCallsFeed />
      </div>

      <div className="mt-6">
        <GlassCard tone="subtle" className="flex items-center justify-between px-6 py-3.5 text-[12px] text-ink-400" tilt={false}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </span>
            Orchestrator live · every tool call & handoff is auditable
          </div>
          <button className="flex items-center gap-1 text-ink-300 hover:text-white">
            Open timeline
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </GlassCard>
      </div>

      {/* React Flow overrides for dark theme */}
      <style>{`
        .react-flow__controls { background: rgba(17,19,27,0.85) !important; border: 1px solid rgba(255,255,255,0.08) !important; backdrop-filter: blur(16px); }
        .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; color: #cfd8ff !important; fill: #cfd8ff !important; }
        .react-flow__controls-button:hover { background: rgba(255,255,255,0.06) !important; }
        .react-flow__minimap { background: rgba(17,19,27,0.85) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
        .react-flow__attribution { display: none !important; }
        .react-flow__handle { width: 10px !important; height: 10px !important; }
        .react-flow__edge-path { stroke-width: 2 !important; }
      `}</style>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  delta: string;
  tone: "brand" | "violet" | "emerald";
}) {
  const toneColor = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
  }[tone];
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${toneColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[22px] font-semibold text-white">{value}</span>
          <Badge tone={tone === "brand" ? "brand" : tone}>{delta}</Badge>
        </div>
      </div>
    </GlassCard>
  );
}
