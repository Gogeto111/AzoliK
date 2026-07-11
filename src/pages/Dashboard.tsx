import * as React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEngine, workforceEngine, DEPARTMENTS, switchIndustry, INDUSTRIES_META } from "@/lib/engine";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Building2,
  TrendingDown,
  DollarSign,
  Activity,
  Sparkles,
  Bot,
  MessageSquare,
  ShoppingBag,
  Settings2,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; tone: "emerald" | "amber" | "muted" | "brand"; icon: any }> = {
  active: { label: "Working", tone: "emerald", icon: Activity },
  training: { label: "Training", tone: "amber", icon: Bot },
  idle: { label: "On standby", tone: "muted", icon: Shield },
  paused: { label: "Paused", tone: "muted", icon: Settings2 },
};

export default function Dashboard() {
  const state = useEngine();
  const industryMeta = INDUSTRIES_META[state.industry];
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 2000);
    return () => window.clearInterval(id);
  }, []);

  const activeDeptCount = DEPARTMENTS.filter((d) => d.status === "active").length;
  const runningTasks = state.activeTasks.filter((t) => t.status === "running" || t.status === "waiting_handoff").length;

  const businessHealth = Math.min(99, 70 + activeDeptCount * 4 + Math.min(15, runningTasks * 2));

  const metrics = {
    revenueAssisted: state.metrics.revenueGenerated,
    customersHelped: state.metrics.customersHelped,
    appointmentsBooked: state.metrics.appointmentsBooked,
    ordersClosed: state.metrics.ordersClosed,
    hoursSaved: Math.round(state.metrics.hoursSaved),
  };

  const departmentStatus = DEPARTMENTS.map((d) => {
    const deptStatus = state.departmentStatus[d.id];
    const running = state.activeTasks.filter(
      (t) => t.department === d.id && (t.status === "running" || t.status === "waiting_handoff")
    ).length;
    const waitingApproval = state.attention.filter(
      (a) => a.department === d.id && a.kind === "approval"
    ).length;
    const completedToday = deptStatus.completedTasksToday;
    const statusInfo = STATUS_LABELS[d.status] || STATUS_LABELS.idle;
    const StatusIcon = statusInfo.icon;

    let currentJobs: string[] = [];
    if (running > 0) currentJobs.push(`${running} task${running > 1 ? "s" : ""} in progress`);
    if (waitingApproval > 0) currentJobs.push(`${waitingApproval} waiting for approval`);
    if (completedToday > 0) currentJobs.push(`${completedToday} completed today`);

    return { dept: d, statusInfo, StatusIcon, running, waitingApproval, completedToday, currentJobs };
  });

  return (
    <div className="space-y-6 pb-4">
      {/* CEO Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-white">
              Good Morning, {state.ownerName} 👋
            </h1>
            <p className="mt-1 text-[13px] text-ink-400">
              {industryMeta?.name} · {industryMeta?.tagline}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GlassCard tone="subtle" className="flex items-center gap-2 px-4 py-2" tilt={false}>
              <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </span>
              <span className="text-[12px] font-medium text-ink-200">Business Health: {businessHealth}%</span>
            </GlassCard>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Sparkles className="h-3.5 w-3.5" /> Switch Industry
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Today's Results - KPI Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <KPICard
          icon={DollarSign}
          iconColor="text-emerald-300"
          label="Revenue Assisted"
          value={`₹${metrics.revenueAssisted.toLocaleString("en-IN")}`}
          delta="+12% vs yesterday"
          trend="up"
        />
        <KPICard
          icon={Users}
          iconColor="text-brand-300"
          label="Customers Helped"
          value={metrics.customersHelped.toLocaleString()}
          delta="+18% this week"
          trend="up"
        />
        <KPICard
          icon={Target}
          iconColor="text-violet-300"
          label="Appointments Booked"
          value={metrics.appointmentsBooked.toLocaleString()}
          delta="+22% this month"
          trend="up"
        />
        <KPICard
          icon={ShoppingBag}
          iconColor="text-amber-300"
          label="Orders Closed"
          value={metrics.ordersClosed.toLocaleString()}
          delta="+8% this week"
          trend="up"
        />
        <KPICard
          icon={Clock}
          iconColor="text-cyan-300"
          label="Hours Saved"
          value={`${metrics.hoursSaved}h`}
          delta="~12h / day"
          trend="up"
        />
      </motion.div>

      {/* Today's AI Workforce - Department Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-white">Today's AI Workforce</h2>
          <Badge tone="emerald" dot pulse>
            {activeDeptCount} of {DEPARTMENTS.length} online
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {departmentStatus.map(({ dept, statusInfo, StatusIcon, currentJobs, running, waitingApproval, completedToday }) => {
            const isActive = dept.status === "active";
            const isWorking = running > 0;
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.12 }}
              >
                <DepartmentStatusCard
                  dept={dept}
                  statusInfo={statusInfo}
                  StatusIcon={StatusIcon}
                  isActive={isActive}
                  isWorking={isWorking}
                  currentJobs={currentJobs}
                  running={running}
                  waitingApproval={waitingApproval}
                  completedToday={completedToday}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Live Activity Feed + Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.15 }}
        className="grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        {/* Activity Feed */}
        <GlassCard className="p-6" tilt={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Activity className="h-4 w-4 text-brand-300" />
              Live Activity
            </h3>
            <Badge tone="emerald" dot pulse>Live</Badge>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {state.timeline.slice(0, 12).map((event, i) => (
              <ActivityItem key={`${event.id}-${i}`} event={event} />
            ))}
            {state.timeline.length === 0 && (
              <div className="py-8 text-center text-[12px] italic text-ink-500">
                No activity yet — your workforce will start working automatically.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Actions + Notifications */}
        <div className="space-y-4">
          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Zap className="h-4 w-4 text-brand-300" />
              Quick Actions
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <QuickActionBtn icon={MessageSquare} label="Reply to Inbox" subtitle={`${state.inbox.length} unread`} />
              <QuickActionBtn icon={CheckCircle2} label="Approve Pending" subtitle={`${state.attention.filter(a => a.kind === "approval").length} waiting`} />
              <QuickActionBtn icon={ShoppingBag} label="Create Order" subtitle="New customer order" />
              <QuickActionBtn icon={Target} label="Book Appointment" subtitle="Schedule a slot" />
            </div>
          </GlassCard>

          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Shield className="h-4 w-4 text-emerald-300" />
              Needs Your Attention
            </h3>
            <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {state.attention.length === 0 ? (
                <div className="py-4 text-center text-[12px] italic text-ink-500">
                  All clear — nothing needs approval right now.
                </div>
              ) : (
                state.attention.slice(0, 5).map((item) => (
                  <AttentionItem key={item.id} item={item} />
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Ask Azolik - Small floating button */}
      <AskAzolikButton />
    </div>
  );
}

function KPICard({
  icon: Icon,
  iconColor,
  label,
  value,
  delta,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}) {
  return (
    <GlassCard className="flex items-center gap-4 p-5" tilt={false}>
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 text-[22px] font-semibold text-white">{value}</div>
        <div className="mt-1 flex items-center gap-1.5">
          <TrendingUp className={cn("h-3 w-3", trend === "up" ? "text-emerald-300" : "text-rose-300")} />
          <span className="text-[11px] font-medium text-ink-300">{delta}</span>
        </div>
      </div>
    </GlassCard>
  );
}

function DepartmentStatusCard({
  dept,
  statusInfo,
  StatusIcon,
  isActive,
  isWorking,
  currentJobs,
  running,
  waitingApproval,
  completedToday,
}: {
  dept: any;
  statusInfo: { label: string; tone: "emerald" | "amber" | "muted" | "brand"; icon: any };
  StatusIcon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isWorking: boolean;
  currentJobs: string[];
  running: number;
  waitingApproval: number;
  completedToday: number;
}) {
  const deptColor = dept.color;
  const Icon = dept.icon;

  return (
    <GlassCard className="relative p-5" tilt={false} interactive={false}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-[200px] w-[200px] rounded-full opacity-20 blur-[60px]" style={{ background: deptColor.glow }} />
      
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]", deptColor.bg)}>
              <Icon className={cn("h-5 w-5", deptColor.text)} strokeWidth={1.9} />
            </div>
            <div>
              <h4 className="text-[14.5px] font-semibold text-white">{dept.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusIcon className={cn("h-3 w-3", isActive ? "text-emerald-300" : "text-ink-400")} />
                <span className="text-[11px] font-medium text-ink-300">{statusInfo.label}</span>
                {isWorking && (
                  <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                )}
              </div>
            </div>
          </div>
          {isActive && (
            <Badge tone="emerald" dot size="sm">
              <Zap className="h-2.5 w-2.5" /> Online
            </Badge>
          )}
        </div>

        {/* Current Jobs */}
        <div className="mt-4 flex-1">
          {currentJobs.length > 0 ? (
            <div className="space-y-1.5">
              {currentJobs.map((job, i) => (
                <div key={i} className="flex items-center gap-2 text-[11.5px] text-ink-300">
                  <span className="relative flex h-1.5 w-1.5">
                    {i === 0 && isWorking && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    )}
                    <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", i === 0 && isWorking ? "bg-emerald-400" : "bg-ink-500")} />
                  </span>
                  <span className="truncate">{job}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11.5px] italic text-ink-500">
              {isActive ? "On standby — ready for work" : "Click to activate"}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
          <Button
            size="sm"
            variant={isActive ? "secondary" : "primary"}
            className="w-full justify-center gap-1.5"
            onClick={() => window.location.href = `/departments/${dept.id}`}
          >
            <Building2 className="h-3.5 w-3.5" /> Open Department
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1 justify-center text-[11px]">
              <Settings2 className="h-3 w-3 mr-1" /> Settings
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 justify-center text-[11px]">
              <Activity className="h-3 w-3 mr-1" /> Analytics
            </Button>
          </div>
          {isActive && (
            <Button size="sm" variant="ghost" className="w-full justify-center text-[11px] text-amber-300 hover:text-amber-100 hover:bg-amber-500/10">
              <Shield className="h-3 w-3 mr-1" /> Pause
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function ActivityItem({ event }: { event: any }) {
  const timeAgo = formatTimeAgo(event.at);
  const icons: Record<string, any> = {
    tool_call: { icon: Bot, color: "text-brand-300" },
    task_completed: { icon: CheckCircle2, color: "text-emerald-300" },
    decision: { icon: Target, color: "text-violet-300" },
    handoff: { icon: Activity, color: "text-amber-300" },
    inbound: { icon: MessageSquare, color: "text-cyan-300" },
    alert: { icon: Shield, color: "text-rose-300" },
  };
  const { icon: Icon, color } = icons[event.type] || { icon: Bot, color: "text-ink-400" };

  return (
    <div className="flex items-start gap-3">
      <div className="relative flex-shrink-0">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/5", color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-white/[0.04]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-medium text-white">{event.title}</span>
          <span className="text-[10px] text-ink-500">{timeAgo}</span>
        </div>
        <p className="mt-0.5 text-[11.5px] text-ink-400 truncate">{event.description}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-500">
          <span className="uppercase tracking-wider">{event.department?.toUpperCase()}</span>
          {event.status === "success" && <span className="text-emerald-300">✓ Completed</span>}
          {event.status === "running" && <span className="text-brand-300">⟳ Running</span>}
          {event.status === "info" && <span className="text-ink-400">ℹ Info</span>}
        </div>
      </div>
    </div>
  );
}

function AttentionItem({ item }: { item: { severity: "info" | "warn" | "urgent"; title: string; detail: string; at: number; kind: string } }) {
  const severityColors: Record<"info" | "warn" | "urgent", string> = {
    info: "text-brand-300 bg-brand-500/10 border-brand-400/20",
    warn: "text-amber-300 bg-amber-500/10 border-amber-400/20",
    urgent: "text-rose-300 bg-rose-500/10 border-rose-400/20",
  };
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-xl border", severityColors[item.severity])}>
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05]">
        <Shield className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-white">{item.title}</span>
          <span className="text-[10px] text-ink-500">{formatTimeAgo(item.at)}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-ink-400">{item.detail}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone={item.severity === "urgent" ? "rose" : item.severity === "warn" ? "amber" : "brand"} size="xs">
            {item.kind}
          </Badge>
          <Button size="xs" variant="secondary" className="h-6 px-2 text-[10.5px]">Review</Button>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon: Icon, label, subtitle }: { icon: any; label: string; subtitle: string }) {
  return (
    <button className="group flex flex-col items-start gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-300 group-hover:scale-110 transition-transform" />
        <span className="text-[13px] font-medium text-white">{label}</span>
      </div>
      <span className="text-[11px] text-ink-500 ml-6">{subtitle}</span>
    </button>
  );
}

function AskAzolikButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 26 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-3 rounded-2xl bg-ink-950/80 backdrop-blur-xl border border-white/10 px-4 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] transition-all hover:border-brand-400/30 hover:shadow-[0_12px_40px_-8px_rgba(95,118,255,0.3)]"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
          <Sparkles className="h-4.5 w-4.5 text-white" />
          {!open && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-xl bg-brand-500/40" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-medium text-white">Need anything?</p>
          <p className="text-[11px] text-ink-400">Ask Azolik…</p>
        </div>
        <span className={cn("transition-transform", open && "rotate-45")}>
          <svg className="h-4 w-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          className="absolute bottom-16 right-0 w-[360px]"
        >
          <GlassCard tone="strong" className="p-0 overflow-hidden" tilt={false}>
            <div className="p-4 border-b border-white/10">
              <p className="text-[13px] font-medium text-white">Ask Azolik</p>
              <p className="text-[11px] text-ink-400 mt-0.5">What do you need help with?</p>
            </div>
            <div className="p-4 space-y-3">
              <SuggestionChip label={'"How many orders today?"'} />
              <SuggestionChip label={'"Show me pending approvals"'} />
              <SuggestionChip label={'"Revenue this week"'} />
              <SuggestionChip label={'"Pause Marketing department"'} />
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Type your request…"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3 py-2 text-[13px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}

function SuggestionChip({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-[12px] text-ink-300 hover:border-white/10 hover:bg-white/[0.04] transition-all">
      <svg className="h-3.5 w-3.5 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <span>{label}</span>
    </button>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}