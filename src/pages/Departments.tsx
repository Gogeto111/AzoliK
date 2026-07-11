import * as React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { DEPARTMENTS } from "@/data/departments";
import { Plus, Bot, CheckCircle2, Wrench, Database, Activity as ActivityIcon, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAI } from "@/lib/aiStore";
import { useEngine } from "@/lib/engine";
import { useNavigate } from "react-router-dom";

export default function Departments() {
  const ai = useAI();
  const navigate = useNavigate();
  const state = useEngine();
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 1500);
    return () => window.clearInterval(id);
  }, []);

  const activate = (name: string) => {
    ai.dispatch({ type: "ACTIVATE_DEPT", dept: name });
  };

  return (
    <div>
      <PageHeader
        title="AI Departments"
        description="Every department is a fully staffed team of AI employees. Each has its own personality, tools, memory, and permissions. Hire new departments or expand teams."
        badge={{ label: `${DEPARTMENTS.filter((d) => d.status === "active").length} of ${DEPARTMENTS.length} online`, tone: "emerald", dot: true, pulse: true }}
        actions={
          <Button size="md" variant="primary">
            <Plus className="h-4 w-4" /> Hire new department
          </Button>
        }
      />

      <div className="space-y-5">
        {DEPARTMENTS.map((d, i) => {
          const Icon = d.icon;
          const runningTasks = state.activeTasks.filter((t) => t.department === d.id).length;
          const recentCalls = state.toolCalls.filter((c) => c.department === d.id).slice(0, 4);
          const isActive = d.status === "active";
          const deptStatus = state.departmentStatus[d.id];
          const currentLine =
            runningTasks > 0 ? deptStatus.line :
            d.status === "training" ? "Training on recent data…" :
            d.status === "idle" ? "On standby — ready for work" :
            "On shift";
          const isWorking = runningTasks > 0 && (deptStatus.tone === "working" || deptStatus.tone === "handoff");
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
                      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{d.name}</h3>
                      <Badge tone={isActive ? "emerald" : d.status === "training" ? "amber" : "muted"} dot={isActive}>
                        {d.status === "active" ? "Online" : d.status === "training" ? "Training" : "Idle"}
                      </Badge>
                      {runningTasks > 0 && (
                        <Badge tone="brand">
                          <ActivityIcon className="h-3 w-3" />{runningTasks} running
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
                          {deptStatus.completedTasksToday} done today
                        </span>
                      )}
                    </div>

                    <p className="mt-3 max-w-2xl text-[12px] italic leading-relaxed text-ink-500">"{d.personality}"</p>

                    {/* Stats row */}
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                      <Stat label="Tasks today" value={d.stats.tasksToday.toLocaleString()} icon={CheckCircle2} tone={d} />
                      <Stat label="Success" value={`${d.stats.successRate}%`} icon={TrendingUp} tone={d} />
                      <Stat label="Avg response" value={d.stats.avgResponseTime} icon={Clock} tone={d} />
                      <Stat label="Agents" value={String(d.agents.length)} icon={Bot} tone={d} />
                      <Stat label="Tools" value={String(d.tools.length)} icon={Wrench} tone={d} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {isActive ? (
                      <>
                        <Button size="sm" variant="primary" onClick={() => navigate(`/departments/${d.id}`)}>Open department</Button>
                        <Button size="sm" variant="ghost" className="text-[12px]">Pause</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => activate(d.name)}>
                        Activate
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
                      {d.agents.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                          <Avatar name={a.name} tone={d.id === "support" ? "cyan" : d.id === "sales" ? "emerald" : d.id === "marketing" ? "violet" : d.id === "operations" ? "amber" : d.id === "finance" ? "rose" : "brand"} size="sm" status={a.status === "active" ? "online" : a.status === "busy" ? "busy" : a.status === "training" ? "idle" : "offline"} />
                          <div className="min-w-0 leading-tight">
                            <div className="truncate text-[12px] font-medium text-white">{a.name}</div>
                            <div className="truncate text-[10.5px] text-ink-400">{a.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                      <Wrench className="h-3 w-3" /> Tools & integrations
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
                        <Plus className="h-3 w-3" /> Connect
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent tool calls */}
                {recentCalls.length > 0 && (
                  <div className="relative border-t border-white/[0.06] bg-black/10 px-6 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                      <ActivityIcon className="h-3 w-3" /> Recent activity
                    </div>
                    <div className="grid gap-1.5 md:grid-cols-2">
                      {recentCalls.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-[11.5px]">
                          {c.status === "running" ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                              <Database className="h-3 w-3 text-brand-300" />
                            </motion.div>
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          )}
                          <span className="text-ink-200">{c.toolName}</span>
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
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-inset ring-white/10", tone.color.bg)}>
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
    whatsapp: "WhatsApp", gmail: "Gmail", sheets: "Sheets", calendar: "Calendar",
    shopify: "Shopify", woo: "WooCommerce", razorpay: "Razorpay", stripe: "Stripe",
    notion: "Notion", slack: "Slack", hubspot: "HubSpot", zoho: "Zoho",
    outlook: "Outlook", discord: "Discord", faqs: "Knowledge Base",
    inventory: "Inventory", orders: "Orders", payments: "Payment Links",
    invoices: "Invoices", expenses: "Expenses", crm: "CRM",
    social: "Social Media", email_marketing: "Email Campaigns", calendar_book: "Booking",
  };
  return map[id] ?? id;
}
