import * as React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useEngine, DEPARTMENTS, workforceEngine } from "@/lib/engine";
import {
  MessageSquare,
  TrendingUp,
  Megaphone,
  Settings2,
  Calculator,
  Users,
  Bot,
  CheckCircle2,
  Wrench,
  Activity,
  Clock,
  TrendingUp as TrendingUpIcon,
  PauseCircle,
  PlayCircle,
  Building2,
  Shield,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; tone: "emerald" | "amber" | "muted" | "brand"; icon: any }> = {
  active: { label: "Working", tone: "emerald", icon: Activity },
  training: { label: "Training", tone: "amber", icon: Bot },
  idle: { label: "On standby", tone: "muted", icon: Shield },
  paused: { label: "Paused", tone: "muted", icon: Settings2 },
};

export default function Departments() {
  const state = useEngine();
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 2000);
    return () => window.clearInterval(id);
  }, []);

  const activate = (name: string) => {
    workforceEngine.setDeptStatus(name as any, `${name} coming online`, "working");
  };

  const pauseDept = (id: string) => {
    workforceEngine.setDeptStatus(id as any, "Paused by owner", "idle");
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Your AI workforce — specialized departments that handle real work. Each has its own team, tools, and permissions."
        badge={{ label: `${DEPARTMENTS.filter((d) => d.status === "active").length} of ${DEPARTMENTS.length} online`, tone: "emerald", dot: true, pulse: true }}
      />

      <div className="space-y-5">
        {DEPARTMENTS.map((d, i) => {
          const Icon = d.icon;
          const runningTasks = state.activeTasks.filter((t) => t.department === d.id && (t.status === "running" || t.status === "waiting_handoff")).length;
          const waitingApproval = state.attention.filter((a) => a.department === d.id && a.kind === "approval").length;
          const completedToday = state.departmentStatus[d.id]?.completedTasksToday ?? 0;
          const isActive = d.status === "active";
          const deptStatus = state.departmentStatus[d.id];
          const currentLine = runningTasks > 0 ? deptStatus.line :
            d.status === "training" ? "Training on recent data…" :
            d.status === "idle" ? "On standby — ready for work" :
            "On shift";
          const isWorking = runningTasks > 0 && (deptStatus.tone === "working" || deptStatus.tone === "handoff");
          const statusInfo = STATUS_LABELS[d.status] || STATUS_LABELS.idle;
          const StatusIcon = statusInfo.icon;

          let currentJobs: string[] = [];
          if (runningTasks > 0) currentJobs.push(`${runningTasks} task${runningTasks > 1 ? "s" : ""} in progress`);
          if (waitingApproval > 0) currentJobs.push(`${waitingApproval} waiting for approval`);
          if (completedToday > 0) currentJobs.push(`${completedToday} completed today`);

          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 240, damping: 28 }}
            >
              <GlassCard className="relative overflow-hidden p-0" tilt={false} interactive={false}>
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full opacity-30 blur-[80px]"
                  style={{ background: d.color.glow }}
                />

                <div className="relative grid gap-5 p-6 md:grid-cols-[auto_1fr_auto]">
                  {/* Avatar */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div
                        className={cn(
                          "relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                          d.color.bg
                        )}
                      >
                        <Icon className={cn("h-7 w-7", d.color.text)} strokeWidth={1.9} />
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

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{d.name} Department</h3>
                      <Badge tone={isActive ? "emerald" : d.status === "training" ? "amber" : "muted"} dot={isActive}>
                        {statusInfo.label}
                      </Badge>
                      {runningTasks > 0 && (
                        <Badge tone="brand">
                          <Activity className="h-3 w-3" />{runningTasks} running
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] text-ink-300">{d.tagline}</p>

                    {/* "Right now" status strip */}
                    <div className={cn(
                      "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]",
                      isWorking
                        ? "border-emerald-400/20 bg-emerald-500/5 text-emerald-100"
                        : "border-white/10 bg-white/[0.02] text-ink-200"
                    )}>
                      <span className="relative flex h-2 w-2">
                        {isWorking && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span className={cn(
                          "relative inline-flex h-2 w-2 rounded-full",
                          isWorking ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-ink-400"
                        )} />
                      </span>
                      <span className="font-medium">
                        {isWorking ? "Right now:" : "Status:"}
                      </span>
                      <span className="truncate text-ink-300">{currentLine}</span>
                      {runningTasks > 0 && (
                        <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-ink-300">
                          {completedToday} done today
                        </span>
                      )}
                    </div>

                    <p className="mt-3 max-w-2xl text-[12px] italic leading-relaxed text-ink-500">"{d.personality}"</p>

                    {/* Stats row */}
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                      <Stat label="Tasks today" value={d.stats.tasksToday.toLocaleString()} icon={CheckCircle2} tone={d} />
                      <Stat label="Success" value={`${d.stats.successRate}%`} icon={TrendingUpIcon} tone={d} />
                      <Stat label="Avg response" value={d.stats.avgResponseTime} icon={Clock} tone={d} />
                      <Stat label="Agents" value={String(d.agents.length)} icon={Bot} tone={d} />
                      <Stat label="Tools" value={String(d.tools.length)} icon={Wrench} tone={d} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {isActive ? (
                      <>
                        <Button size="sm" variant="primary" onClick={() => window.location.href = `/departments/${d.id}`}>
                          <Building2 className="h-3.5 w-3.5" /> Open Department
                        </Button>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-[12px]">
                            <Settings2 className="h-3 w-3 mr-1" /> Settings
                          </Button>
                          <Button size="sm" variant="ghost" className="text-[12px]">
                            <BarChart2 className="h-3 w-3 mr-1" /> Analytics
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" className="w-full justify-center text-[12px] text-amber-300 hover:text-amber-100 hover:bg-amber-500/10">
                          <Shield className="h-3 w-3 mr-1" /> Pause
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => activate(d.name)}>
                        <PlayCircle className="h-3.5 w-3.5 mr-1" /> Activate
                      </Button>
                    )}
                  </div>
                </div>

                {/* Agents row */}
                <div className="relative grid gap-4 border-t border-white/[0.06] px-6 py-4 md:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                      <Bot className="h-3 w-3" /> Team members ({d.agents.length})
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {d.agents.map((a) => {
                        const busy = state.activeTasks.some((t) => t.department === d.id && t.assignee === a.name && t.status === "running");
                        const tone = d.id === "support" ? "cyan" : d.id === "sales" ? "emerald" : d.id === "marketing" ? "violet" : d.id === "operations" ? "amber" : d.id === "finance" ? "rose" : "brand";
                        return (
                          <div key={a.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                            <Avatar name={a.name} tone={tone as any} size="sm" status={busy ? "online" : a.status === "idle" ? "idle" : a.status === "busy" ? "busy" : "offline"} />
                            <div className="min-w-0 leading-tight">
                              <div className="truncate text-[12px] font-medium text-white">{a.name}</div>
                              <div className="truncate text-[10.5px] text-ink-400">{a.role}</div>
                              {busy && <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-300"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>Working</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                      <Wrench className="h-3 w-3" /> Connected tools & integrations
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.integrations.map((t) => {
                        const name = toolName(t);
                        return (
                          <div
                            key={t}
                            className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[11px] text-ink-200"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color.primary }} />
                            {name}
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          </div>
                        );
                      })}
                      <button className="flex items-center gap-1 rounded-md border border-dashed border-white/10 px-2 py-1 text-[11px] text-ink-400 transition-colors hover:border-white/20 hover:text-white">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Connect
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent tool calls */}
                {getRecentCalls(d.id, state).length > 0 && (
                  <div className="relative border-t border-white/[0.06] bg-black/10 px-6 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                      <Activity className="h-3 w-3" /> Recent activity
                    </div>
                    <div className="grid gap-1.5 md:grid-cols-2">
                      {getRecentCalls(d.id, state).map((c: any) => (
                        <div key={c.id} className="flex items-center gap-2 text-[11.5px]">
                          {c.status === "running" ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                              <svg className="h-3 w-3 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </motion.div>
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          )}
                          <span className="text-ink-200">{toolName(c.tool)}</span>
                          <span className="text-ink-500">·</span>
                          <span className="text-ink-400">{Math.round((Date.now() - c.startedAt) / 1000)}s ago</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: any }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-inset", tone.color.bg)}>
        <Icon className={cn("h-3.5 w-3.5", tone.color.text)} />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[13px] font-semibold tabular-nums text-white">{value}</div>
        <div className="truncate text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      </div>
    </div>
  );
}

function toolName(id: string) {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp", gmail: "Gmail", sheets: "Google Sheets", calendar: "Google Calendar",
    shopify: "Shopify", woo: "WooCommerce", razorpay: "Razorpay", stripe: "Stripe",
    notion: "Notion", slack: "Slack", hubspot: "HubSpot", zoho: "Zoho CRM",
    outlook: "Outlook", discord: "Discord", faqs: "Knowledge Base", inventory: "Inventory",
    orders: "Orders", payments: "Payment Links", invoices: "Invoices", expenses: "Expenses",
    crm: "CRM", social: "Social Media", email_marketing: "Email Campaigns", calendar_book: "Booking",
  };
  return map[id] ?? id;
}

function getRecentCalls(deptId: string, state: any) {
  return state.toolCalls.filter((c: any) => c.department === deptId).slice(0, 4);
}