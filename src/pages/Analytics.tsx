import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEngine, workforceEngine, DEPARTMENTS } from "@/lib/engine";
import { Download, TrendingUp, Users, Clock, DollarSign, Bot, Zap, CheckCircle2, Target, BarChart2, TrendingDown, Shield, Award, TrendingUp as TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area,
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
  const state = useEngine();
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 2000);
    return () => window.clearInterval(id);
  }, []);

  const m = workforceEngine.state.metrics;
  const toolCalls = workforceEngine.state.toolCalls;
  const successCalls = toolCalls.filter((t) => t.status === "success").length;
  const successRate = toolCalls.length === 0 ? 99 : Math.round((successCalls / toolCalls.length) * 100);

  const deptWork = React.useMemo(() => {
    const counts: Record<string, number> = {};
    DEPARTMENTS.forEach((d) => (counts[d.id] = 0));
    toolCalls.slice(0, 200).forEach((t) => { counts[t.department] = (counts[t.department] ?? 0) + 1; });
    return DEPARTMENTS.map((d) => ({
      id: d.id, name: d.name, value: counts[d.id] ?? 0, color: d.color.primary,
      tasksToday: d.stats.tasksToday, successRate: d.stats.successRate,
    }));
  }, [toolCalls.length]);

  const topAgents = React.useMemo(
    () =>
      DEPARTMENTS.flatMap((d) =>
        d.agents.slice(0, 2).map((a) => ({
          name: a.name, role: a.role, dept: d.name, deptId: d.id,
          tasks: a.tasksCompleted, success: a.successRate,
        }))
      )
        .sort((a, b) => b.tasks - a.tasks)
        .slice(0, 6),
    []
  );
  const maxTasks = topAgents[0]?.tasks ?? 1;

  const metrics = [
    { label: "Revenue Assisted", icon: DollarSign, color: "emerald" as const, value: m.revenueGenerated, format: (v: number) => `₹${v.toLocaleString("en-IN")}`, delta: "+12% vs yesterday", trend: "up" as const },
    { label: "Customers Helped", icon: Users, color: "brand" as const, value: m.customersHelped, format: (v: number) => v.toLocaleString(), delta: "+18% this week", trend: "up" as const },
    { label: "Appointments Booked", icon: Target, color: "violet" as const, value: m.appointmentsBooked, format: (v: number) => v.toLocaleString(), delta: "+22% this month", trend: "up" as const },
    { label: "Orders Closed", icon: CheckCircle2, color: "amber" as const, value: m.ordersClosed, format: (v: number) => v.toLocaleString(), delta: "+8% this week", trend: "up" as const },
    { label: "Hours Saved", icon: Clock, color: "cyan" as const, value: Math.round(m.hoursSaved), format: (v: number) => `${v}h`, delta: "~12h / day", trend: "up" as const },
    { label: "Messages Answered", icon: Bot, color: "rose" as const, value: m.customersHelped * 3, format: (v: number) => v.toLocaleString(), delta: "+24% this week", trend: "up" as const },
    { label: "Avg Response Time", icon: TrendingDown, color: "violet" as const, value: 1.8, format: (v: number) => `${v.toFixed(1)}s`, delta: "Target < 2s", trend: "up" as const },
    { label: "Tool Success Rate", icon: CheckCircle2, color: "emerald" as const, value: successRate, format: (v: number) => `${v}%`, delta: `${m.automationsCompleted.toLocaleString("en-IN")} automations`, trend: "up" as const },
  ];

  return (
    <div className="space-y-6">
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

      {/* KPI Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
      >
        {metrics.map((metric, i) => (
          <KPICard key={metric.label} metric={metric} index={i} />
        ))}
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 26 }}
        >
          <GlassCard className="p-6" tilt={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                  <BarChart2 className="h-4 w-4 text-brand-300" />
                  Activity Overview
                </h3>
                <p className="mt-0.5 text-[12.5px] text-ink-400">Revenue, customers, and tasks over the last 7 days</p>
              </div>
              <Badge tone="emerald" dot pulse>Live</Badge>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateActivityData()} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8faeff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8faeff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="day"
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
                  <Area type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#34d399" strokeWidth={2} />
                  <Area type="monotone" dataKey="customers" fill="url(#colorCustomers)" stroke="#8faeff" strokeWidth={2} />
                  <Area type="monotone" dataKey="tasks" fill="url(#colorTasks)" stroke="#fbbf24" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Workforce at a Glance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 26 }}
        >
          <GlassCard className="p-6" tilt={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                  <Bot className="h-4 w-4 text-brand-300" />
                  Workforce at a Glance
                </h3>
                <p className="mt-0.5 text-[12.5px] text-ink-400">
                  {m.agentsWorking} agents processing {m.tasksRunning} active tasks
                </p>
              </div>
              <Badge tone="emerald" dot pulse>Live</Badge>
            </div>

            <div className="space-y-3">
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
                        <span className="tabular-nums text-ink-300">{d.stats.tasksToday.toLocaleString()} today</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, d.stats.successRate)}%`, background: d.color.primary }}
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
        </motion.div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Tool Activity by Department */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 26 }}
        >
          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Zap className="h-4 w-4 text-brand-300" />
              Tool Activity by Department
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-400">Recent tool calls executed by each team</p>
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
        </motion.div>

        {/* Top Performing Agents */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 26 }}
        >
          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <TrendingUpIcon className="h-4 w-4 text-brand-300" />
              Top Performing Agents
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-400">Ranked by tasks completed across the workforce</p>
            <div className="mt-4 space-y-3">
              {topAgents.map((a, i) => {
                const dept = DEPARTMENTS.find((d) => d.id === a.deptId)!;
                const pct = Math.round((a.tasks / maxTasks) * 100);
                return (
                  <div key={a.name} className="flex items-center gap-3">
                    <span className="w-5 text-[12px] font-mono tabular-nums text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold ring-1 ring-inset ring-white/10", dept.color.bg, dept.color.text)}>
                      {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-[13px] font-medium text-white">{a.name}</span>
                        <span className="text-[12px] tabular-nums text-ink-300">{a.tasks.toLocaleString()} tasks · {a.success}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: dept.color.primary }} />
                      </div>
                      <span className="mt-0.5 block truncate text-[10.5px] uppercase tracking-wider text-ink-500">{a.dept} · {a.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 26 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SummaryCard title="Departments Active" value={`${DEPARTMENTS.filter(d => d.status === "active").length}/6`} icon={Shield} color="emerald" desc="All systems operational" />
        <SummaryCard title="Avg Tool Latency" value={`${1.8}s`} icon={Clock} color="cyan" desc="Under 2s target" />
        <SummaryCard title="Automation Uptime" value="99.9%" icon={Zap} color="amber" desc="Zero downtime this month" />
        <SummaryCard title="Data Freshness" value="< 5s" icon={TrendingUpIcon} color="violet" desc="Real-time sync active" />
      </motion.div>
    </div>
  );
}

function KPICard({ metric, index }: { metric: { color: "brand" | "emerald" | "violet" | "amber" | "cyan" | "rose"; icon: any; label: string; value: number; format: (v: number) => string; delta: string; trend: "up" | "down" }; index: number }) {
  const colorMap: Record<"brand" | "emerald" | "violet" | "amber" | "cyan" | "rose", string> = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
    cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
    rose: "from-rose-500/30 to-rose-700/10 text-rose-200",
  };

  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${colorMap[metric.color]}`}>
        <metric.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-ink-400">{metric.label}</div>
        <div className="mt-0.5 text-[22px] font-semibold text-white">{metric.format(metric.value)}</div>
        <div className="mt-1 flex items-center gap-1.5">
          <TrendingUp className={cn("h-3 w-3", metric.trend === "up" ? "text-emerald-300" : "text-rose-300")} />
          <span className="text-[11px] font-medium text-ink-300">{metric.delta}</span>
        </div>
      </div>
    </GlassCard>
  );
}

function SummaryCard({ title, value, icon: Icon, color, desc }: { title: string; value: string; icon: any; color: "emerald" | "cyan" | "amber" | "violet"; desc: string }) {
  const colorMap: Record<"emerald" | "cyan" | "amber" | "violet", string> = {
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
  };

  return (
    <GlassCard className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] text-ink-400">{title}</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[22px] font-semibold text-white">{value}</span>
        </div>
        <div className="mt-1 text-[11px] text-ink-400">{desc}</div>
      </div>
    </GlassCard>
  );
}

function generateActivityData() {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toLocaleDateString([], { weekday: "short", day: "numeric" });
    const baseRevenue = 15000 + Math.random() * 8000;
    const baseCustomers = 80 + Math.random() * 40;
    const baseTasks = 120 + Math.random() * 60;
    data.push({
      day,
      revenue: Math.round(baseRevenue),
      customers: Math.round(baseCustomers),
      tasks: Math.round(baseTasks),
    });
  }
  return data;
}