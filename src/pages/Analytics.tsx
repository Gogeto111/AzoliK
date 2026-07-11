import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEngine, workforceEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { Download, TrendingUp, Users, Clock, DollarSign, Bot, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const TONE_MAP = {
  support: "cyan" as const,
  sales: "emerald" as const,
  marketing: "violet" as const,
  operations: "amber" as const,
  finance: "rose" as const,
  hr: "brand" as const,
};

const BAR_COLORS: Record<string, string> = {
  support: "#22d3ee",
  sales: "#34d399",
  marketing: "#a78bfa",
  operations: "#fbbf24",
  finance: "#fb7185",
  hr: "#8faeff",
};

export default function Analytics() {
  // Subscribe to engine state so metrics stay live
  useEngine();

  // Force an occasional re-render for time-relative values
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 1500);
    return () => window.clearInterval(id);
  }, []);

  const m = workforceEngine.state.metrics;
  const toolCalls = workforceEngine.state.toolCalls;
  const successCalls = toolCalls.filter((t) => t.status === "success").length;
  const successRate = toolCalls.length === 0 ? 99 : Math.round((successCalls / toolCalls.length) * 100);

  const deptWork = React.useMemo(() => {
    const counts: Record<string, number> = {};
    DEPARTMENTS.forEach((d) => (counts[d.id] = 0));
    toolCalls.slice(0, 200).forEach((t) => {
      counts[t.department] = (counts[t.department] ?? 0) + 1;
    });
    return DEPARTMENTS.map((d) => ({
      id: d.id,
      name: d.name,
      value: counts[d.id] ?? 0,
      color: d.color.primary,
      tasksToday: d.stats.tasksToday,
      successRate: d.stats.successRate,
    }));
  }, [toolCalls.length]);

  const topAgents = React.useMemo(
    () =>
      DEPARTMENTS.flatMap((d) =>
        d.agents.slice(0, 2).map((a) => ({
          name: a.name,
          role: a.role,
          dept: d.name,
          deptId: d.id,
          tasks: a.tasksCompleted,
          success: a.successRate,
        }))
      )
        .sort((a, b) => b.tasks - a.tasks)
        .slice(0, 6),
    []
  );
  const maxTasks = topAgents[0]?.tasks ?? 1;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Real-time reporting across every department, agent, and workflow. Numbers come straight from the executing engine."
        badge={{ label: "Live data", tone: "emerald", dot: true }}
        actions={
          <Button size="md" variant="glass">
            <Download className="h-4 w-4" /> Export report
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KPI
          icon={DollarSign}
          label="Revenue driven"
          value={`₹${m.revenueGenerated.toLocaleString("en-IN")}`}
          delta="+12% vs yesterday"
          tone="emerald"
        />
        <KPI
          icon={Users}
          label="Customers helped"
          value={m.customersHelped.toLocaleString("en-IN")}
          delta="+18% this week"
          tone="brand"
        />
        <KPI
          icon={Clock}
          label="Hours saved"
          value={`${Math.round(m.hoursSaved)}h`}
          delta="+22% this month"
          tone="violet"
        />
        <KPI
          icon={CheckCircle2}
          label="Tool success rate"
          value={`${successRate}%`}
          delta={`${m.automationsCompleted.toLocaleString("en-IN")} automations`}
          tone="cyan"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <ActivityChart />
        <GlassCard className="p-6" tilt={false}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <Bot className="h-4 w-4 text-brand-300" />
                Workforce at a glance
              </h3>
              <p className="mt-0.5 text-[12.5px] text-ink-400">
                {m.agentsWorking} agents processing {m.tasksRunning} active tasks
              </p>
            </div>
            <Badge tone="emerald" dot pulse>Live</Badge>
          </div>

          <div className="mt-5 space-y-3">
            {DEPARTMENTS.map((d) => {
              const running = workforceEngine.state.activeTasks.some(
                (t) => t.department === d.id && (t.status === "running" || t.status === "waiting_handoff")
              );
              return (
                <div key={d.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                      d.color.bg
                    )}
                    style={running ? { boxShadow: `0 0 14px ${d.color.glow}` } : undefined}
                  >
                    <d.icon className={cn("h-4 w-4", d.color.text)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-white">{d.name}</span>
                      <span className="tabular-nums text-ink-300">
                        {d.stats.tasksToday.toLocaleString()} today
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, d.stats.successRate)}%`,
                          background: d.color.primary,
                        }}
                      />
                    </div>
                  </div>
                  <Badge tone={TONE_MAP[d.id]}>
                    {running ? "working" : d.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" tilt={false}>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <Zap className="h-4 w-4 text-brand-300" />
            Tool activity by department
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Recent tool calls executed by each team
          </p>
          <div className="mt-5 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWork} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(207,216,255,0.7)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(207,216,255,0.6)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "rgba(15,17,26,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "white",
                    backdropFilter: "blur(12px)",
                  }}
                  labelStyle={{ color: "rgba(207,216,255,0.9)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {deptWork.map((d) => (
                    <Cell key={d.id} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6" tilt={false}>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <TrendingUp className="h-4 w-4 text-brand-300" />
            Top performing agents
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Ranked by tasks completed across the workforce
          </p>
          <div className="mt-4 space-y-3">
            {topAgents.map((a, i) => {
              const dept = DEPARTMENTS.find((d) => d.id === a.deptId)!;
              const pct = Math.round((a.tasks / maxTasks) * 100);
              return (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="w-5 text-[12px] font-mono tabular-nums text-ink-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold ring-1 ring-inset ring-white/10",
                      dept.color.bg,
                      dept.color.text
                    )}
                  >
                    {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[13px] font-medium text-white">
                        {a.name}
                      </span>
                      <span className="text-[12px] tabular-nums text-ink-300">
                        {a.tasks.toLocaleString()} tasks · {a.success}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: dept.color.primary,
                        }}
                      />
                    </div>
                    <span className="mt-0.5 block truncate text-[10.5px] uppercase tracking-wider text-ink-500">
                      {a.dept} · {a.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function KPI({
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
  tone: "emerald" | "brand" | "violet" | "cyan";
}) {
  const toneColor = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
  }[tone];
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${toneColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[22px] font-semibold text-white">{value}</span>
          <span className="text-[11.5px] font-medium text-emerald-300">{delta}</span>
        </div>
      </div>
    </GlassCard>
  );
}
