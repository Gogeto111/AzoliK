import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useEngine, workforceEngine, DEPARTMENTS } from "@/lib/engine";
import {
  Bot, Activity, Brain, Zap, CheckCircle2, Clock, AlertCircle,
  MessageSquare, TrendingUp, Megaphone, Settings2, Calculator, Users,
  Eye, PauseCircle, PlayCircle, Settings, BarChart2, Wifi, WifiOff,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Helper function to get event icon - returns JSX element directly
function getEventIconElement(type: string) {
  const icons: Record<string, any> = {
    tool_call: Bot,
    task_completed: CheckCircle2,
    decision: AlertCircle,
    handoff: Activity,
    inbound: MessageSquare,
    alert: AlertCircle,
    integration_sync: Zap,
  };
  const Icon = icons[type] || Bot;
  return <Icon className="h-3.5 w-3.5" />;
}

const DEPT_ICONS: Record<string, any> = {
  support: MessageSquare,
  sales: TrendingUp,
  marketing: Megaphone,
  operations: Settings2,
  finance: Calculator,
  hr: Users,
};

const DEPT_LABELS: Record<string, string> = {
  support: "Support",
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
  finance: "Finance",
  hr: "HR",
};

const AGENT_MESSAGES: Record<string, string[]> = {
  support: [
    "Reading incoming WhatsApp message...",
    "Checking FAQ for chocolate cake availability",
    "Verifying inventory: 6 units in stock",
    "Drafting customer reply",
    "Handoff to Sales for payment link",
  ],
  sales: [
    "Reviewing new lead from Support",
    "Logging lead in CRM",
    "Generating Razorpay payment link",
    "Scheduling demo call for tomorrow",
    "Handoff to Operations for fulfillment",
  ],
  marketing: [
    "Analyzing engagement metrics",
    "Drafting tomorrow's Instagram post",
    "Scheduling campaign for 6 PM",
    "Queuing story sequence",
    "Notifying team for approval",
  ],
  operations: [
    "Syncing inventory across Shopify & WooCommerce",
    "Processing 3 new orders",
    "Updating stock levels",
    "Coordinating with kitchen for prep",
    "Notifying rider for pickup",
  ],
  finance: [
    "Reading vendor invoice from Gmail",
    "OCR parsing line items",
    "Matching to purchase order",
    "Logging to Google Sheets",
    "Flagging GST mismatch for review",
  ],
  hr: [
    "Screening 5 new applications",
    "Scheduling interview for tomorrow",
    "Sending offer letter to candidate",
    "Updating onboarding checklist",
    "Posting new role to LinkedIn",
  ],
};

export default function AIWorkforce() {
  const state = useEngine();
  const prefersReduced = useReducedMotion() ?? false;
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 1500);
    return () => window.clearInterval(id);
  }, []);

  const activeDeptCount = DEPARTMENTS.filter((d: any) => d.status === "active").length;
  const totalAgents = DEPARTMENTS.reduce((sum, d) => sum + d.agents.length, 0);
  const activeAgents = DEPARTMENTS.reduce((sum, d: any) => sum + d.agents.filter((a: any) => a.status === "active" || a.status === "busy").length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Workforce"
        description="Watch your departments think, work, and hand off in real time. Each agent shows its current thought process."
        badge={{ label: `${activeDeptCount}/${DEPARTMENTS.length} departments online`, tone: "emerald", dot: true, pulse: true }}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[12px] text-ink-400">
              <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {activeAgents}/{totalAgents} agents working
            </span>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Bot} label="Total Agents" value={totalAgents} delta={`${activeAgents} active`} tone="brand" />
        <StatTile icon={Activity} label="Departments Online" value={`${activeDeptCount}/${DEPARTMENTS.length}`} delta="All systems go" tone="emerald" />
        <StatTile icon={Zap} label="Tasks in Progress" value={state.activeTasks.filter((t: any) => t.status === "running" || t.status === "waiting_handoff").length} delta={`${state.metrics.automationsCompleted} completed today`} tone="violet" />
        <StatTile icon={Brain} label="Thinking Cycles" value={`${Math.floor(Math.random() * 20) + 40}/min`} delta="Real-time reasoning" tone="amber" />
      </div>

      {/* Department Cards - Alive View */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 }}
        className="grid gap-5"
      >
        {DEPARTMENTS.map((dept: any, i: number) => (
          <DepartmentLiveCard key={dept.id} dept={dept} index={i} state={state} prefersReduced={prefersReduced} />
        ))}
      </motion.div>

      {/* Live Thought Stream */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }}
      >
        <GlassCard className="p-6" tilt={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Brain className="h-4 w-4 text-brand-300" />
              Live Thought Stream
            </h3>
            <Badge tone="emerald" dot pulse>Streaming</Badge>
          </div>
          <ThoughtStream state={state} />
        </GlassCard>
      </motion.div>
    </div>
  );
}

function DepartmentLiveCard({ dept, index, state, prefersReduced }: { dept: any; index: number; state: any; prefersReduced: boolean }) {
  const Icon = DEPT_ICONS[dept.id];
  const runningTasks = state.activeTasks.filter(
    (t: any) => t.department === dept.id && (t.status === "running" || t.status === "waiting_handoff")
  );
  const deptStatus = state.departmentStatus[dept.id];
  const completedToday = deptStatus?.completedTasksToday ?? 0;
  const isActive = dept.status === "active";
  const isWorking = runningTasks.length > 0;
  const agents = dept.agents;
  const activeAgents = agents.filter((a: any) => a.status === "active" || a.status === "busy");
  const messages = AGENT_MESSAGES[dept.id] || AGENT_MESSAGES.support;
  const currentMessage = messages[Math.floor(Math.random() * messages.length)];
  const thinkingAgent = activeAgents[Math.floor(Math.random() * Math.max(1, activeAgents.length))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 240, damping: 28 }}
    >
      <GlassCard className="relative overflow-hidden p-0" tilt={false} interactive={false}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full opacity-30 blur-[80px]" style={{ background: dept.color.glow }} />

        <div className="relative grid gap-5 p-6 md:grid-cols-[auto_1fr_auto]">
          {/* Dept Avatar */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={cn(
                "relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                dept.color.bg
              )}>
                <Icon className={cn("h-7 w-7", dept.color.text)} strokeWidth={1.9} />
              </div>
              {isActive && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-900 ring-2 ring-ink-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Dept Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{DEPT_LABELS[dept.id]} Department</h3>
              <Badge tone={isActive ? "emerald" : dept.status === "training" ? "amber" : "muted"} dot={isActive}>
                {isActive ? "Working" : dept.status === "training" ? "Training" : "Idle"}
              </Badge>
              {runningTasks.length > 0 && (
                <Badge tone="brand"><Activity className="h-3 w-3" />{runningTasks.length} running</Badge>
              )}
            </div>
            <p className="mt-1 text-[13px] text-ink-300">{dept.tagline}</p>

            {/* Status bar */}
            <div className={cn(
              "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]",
              isWorking ? "border-emerald-400/20 bg-emerald-500/5 text-emerald-100" : "border-white/10 bg-white/[0.02] text-ink-200"
            )}>
              <span className="relative flex h-2 w-2">
                {isWorking && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", isWorking ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-ink-400")} />
              </span>
              <span className="font-medium">{isWorking ? "Right now:" : "Status:"}</span>
              <span className="truncate text-ink-300">{isWorking ? deptStatus?.line || currentMessage : "On standby - ready for work"}</span>
              {runningTasks.length > 0 && (
                <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-ink-300">
                  {completedToday} done today
                </span>
              )}
            </div>

            {/* Current thought */}
            {isWorking && thinkingAgent && (
              <div className="mt-3 p-3 rounded-xl border border-white/10 bg-black/20">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={thinkingAgent.name} tone={dept.id === "support" ? "cyan" : dept.id === "sales" ? "emerald" : dept.id === "marketing" ? "violet" : dept.id === "operations" ? "amber" : dept.id === "finance" ? "rose" : "brand"} size="sm" status="online" />
                  <div>
                    <p className="text-[12px] font-medium text-white">{thinkingAgent.name}</p>
                    <p className="text-[10px] text-ink-400">{thinkingAgent.role}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-brand-300">
                    <Zap className="h-3 w-3" /> Thinking...
                  </span>
                </div>
                <p className="text-[12px] italic text-ink-200">"{currentMessage}"</p>
              </div>
            )}
          </div>

          {/* Agent Grid */}
          <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
{agents.map((a: any) => {
                const busy = runningTasks.some((t: any) => t.assignee === a.name);
                const tone = dept.id === "support" ? "cyan" : dept.id === "sales" ? "emerald" : dept.id === "marketing" ? "violet" : dept.id === "operations" ? "amber" : dept.id === "finance" ? "rose" : "brand";
                return (
                  <div key={a.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all", busy ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.06] bg-white/[0.02]")}>
                    <Avatar name={a.name} tone={tone as any} size="sm" status={busy ? "online" : a.status === "idle" ? "idle" : a.status === "busy" ? "busy" : "offline"} />
                    <div className="hidden sm:block min-w-0 leading-tight">
                      <div className="truncate text-[12px] font-medium text-white">{a.name}</div>
                      <div className="truncate text-[10px] text-ink-400">{a.role}</div>
                    </div>
                    {busy && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                        <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>
                        Working
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 md:flex-row">
              <Button size="sm" variant="secondary" className="gap-1">
                <Eye className="h-3.5 w-3.5" /> View Details
              </Button>
              <Button size="sm" variant="ghost" className="text-[11px]">
                <Settings className="h-3 w-3 mr-1" /> Settings
              </Button>
              <Button size="sm" variant="ghost" className="text-[11px]">
                <BarChart2 className="h-3 w-3 mr-1" /> Analytics
              </Button>
              {isActive && (
                <Button size="sm" variant="ghost" className="text-[11px] text-amber-300 hover:text-amber-100 hover:bg-amber-500/10">
                  <PauseCircle className="h-3 w-3 mr-1" /> Pause
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Agents row */}
        <div className="relative grid gap-4 border-t border-white/[0.06] px-6 py-4">
          <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
            <Bot className="h-3 w-3" /> Team ({agents.length} agents, {activeAgents.length} active)
          </div>
          <div className="flex flex-wrap gap-3">
            {agents.map((a: any, idx: number) => {
              const busy = runningTasks.some((t: any) => t.department === dept.id && t.assignee === a.name && t.status === "running");
              const tone = dept.id === "support" ? "cyan" : dept.id === "sales" ? "emerald" : dept.id === "marketing" ? "violet" : dept.id === "operations" ? "amber" : dept.id === "finance" ? "rose" : "brand";
              return (
                <div key={a.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all", busy ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.06] bg-white/[0.02]")}>
                  <Avatar name={a.name} tone={tone as any} size="sm" status={busy ? "online" : a.status === "idle" ? "idle" : a.status === "busy" ? "busy" : "offline"} />
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-[12px] font-medium text-white">{a.name}</div>
                    <div className="truncate text-[10.5px] text-ink-400">{a.role}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-500">
                      <span>{a.tasksCompleted.toLocaleString()} tasks</span>
                      <span>.</span>
                      <span>{a.successRate}% success</span>
                      {busy && <> <span>.</span> <span className="text-emerald-300">working</span> </>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent tool calls */}
        {getRecentCalls(dept.id, state).length > 0 && (
          <div className="relative border-t border-white/[0.06] bg-black/10 px-6 py-3">
            <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
              <Activity className="h-3 w-3" /> Recent activity
            </div>
            <div className="grid gap-1.5 md:grid-cols-2">
              {getRecentCalls(dept.id, state).map((c: any, i: number) => (
                <div key={c.id} className="flex items-center gap-2 text-[11.5px]">
                  {c.status === "running" ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                      <svg className="h-3 w-3 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </motion.div>
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  )}
                  <span className="text-ink-200">{toolName(c.tool)}</span>
                  <span className="text-ink-500">.</span>
                  <span className="text-ink-400">{Math.round((Date.now() - c.startedAt) / 1000)}s ago</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function StatTile({ icon: Icon, label, value, delta, tone }: { icon: any; label: string; value: string | number; delta: string; tone: "brand" | "emerald" | "violet" | "amber" }) {
  const toneColor = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
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

function ThoughtStream({ state }: { state: any }) {
  const events = state.timeline.slice(0, 15);

  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <Brain className="h-12 w-12 text-ink-500 mx-auto mb-3" />
        <p className="text-[13px] text-ink-400">Your workforce will start thinking automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {events.map((event: any, i: number) => (
        <motion.div
          key={`${event.id}-${i}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-start gap-3"
        >
          <div className="relative flex-shrink-0">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/5", getEventColor(event.type))}>
              {getEventIconElement(event.type)}
            </div>
            <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-white/[0.04]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white">{event.title}</span>
              <span className="text-[10px] text-ink-500">{formatTimeAgo(event.timestamp)}</span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-ink-400 truncate">{event.description}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-500">
              <span className="uppercase tracking-wider">{event.department?.toUpperCase()}</span>
              {event.status === "success" && <span className="text-emerald-300">Completed</span>}
              {event.status === "running" && <span className="text-brand-300">Processing</span>}
              {event.status === "info" && <span className="text-ink-400">Info</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    tool_call: "text-brand-300",
    task_completed: "text-emerald-300",
    decision: "text-violet-300",
    handoff: "text-amber-300",
    inbound: "text-cyan-300",
    alert: "text-rose-300",
    integration_sync: "text-emerald-300",
  };
  return colors[type] || "text-ink-400";
}

function getRecentCalls(deptId: string, state: any) {
  return state.toolCalls.filter((c: any) => c.department === deptId).slice(0, 4);
}

function toolName(id: string) {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp", gmail: "Gmail", sheets: "Sheets", calendar: "Calendar",
    shopify: "Shopify", woo: "WooCommerce", razorpay: "Razorpay", stripe: "Stripe",
    notion: "Notion", slack: "Slack", hubspot: "HubSpot", zoho: "Zoho",
    faqs: "FAQs", inventory: "Inventory", orders: "Orders", payments: "Payment Link",
    invoices: "Invoices", expenses: "Expenses", crm: "CRM", social: "Social Post",
    email_marketing: "Email Campaign", calendar_book: "Book Appt",
  };
  return map[id] ?? id;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}