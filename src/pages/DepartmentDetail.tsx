import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { DEPARTMENTS } from "@/data/departments";
import { useEngine, workforceEngine } from "@/lib/engine";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Wrench,
  Activity as ActivityIcon,
  Clock,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useEngine();

  const dept = DEPARTMENTS.find((d) => d.id === id);

  const [paused, setPaused] = React.useState(false);

  if (!dept) {
    return (
      <div>
        <PageHeader title="Department not found" description="This department doesn't exist." />
        <Button onClick={() => navigate("/departments")}>Back to departments</Button>
      </div>
    );
  }

  const Icon = dept.icon;
  const runningTasks = state.activeTasks.filter((t) => t.department === dept.id);
  const recentCalls = state.toolCalls.filter((c) => c.department === dept.id).slice(0, 6);
  const st = state.departmentStatus[dept.id];
  const isWorking = runningTasks.length > 0;

  const togglePause = () => {
    // Pausing an individual dept stops the entire engine for simplicity in
    // this simulation; a production build would route tasks away.
    if (paused) workforceEngine.start();
    else workforceEngine.stop();
    setPaused((p) => !p);
  };

  return (
    <div>
      <PageHeader
        title={dept.name}
        description={dept.tagline}
        badge={{ label: isWorking ? "Working" : paused ? "Paused" : "Online", tone: paused ? "muted" : isWorking ? "emerald" : "brand", dot: !paused }}
        actions={
          <>
            <Button size="md" variant="glass" onClick={() => navigate("/departments")}>
              <ArrowLeft className="h-4 w-4" /> All departments
            </Button>
            <Button size="md" variant={paused ? "primary" : "ghost"} onClick={togglePause}>
              {paused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {paused ? "Resume" : "Pause"}
            </Button>
          </>
        }
      />

      {/* Hero identity card */}
      <GlassCard className="relative overflow-hidden p-0" tilt={false}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full opacity-30 blur-[80px]" style={{ background: dept.color.glow }} />
        <div className="relative grid gap-6 p-7 md:grid-cols-[auto_1fr_auto]">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                dept.color.bg
              )}
              style={isWorking ? { boxShadow: `0 0 30px ${dept.color.glow}, inset 0 1px 0 rgba(255,255,255,0.2)` } : undefined}
            >
              <Icon className={cn("h-9 w-9", dept.color.text)} strokeWidth={1.9} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white">{dept.name} Department</h2>
              <Badge tone={isWorking ? "emerald" : "muted"} dot={isWorking}>
                {isWorking ? `${runningTasks.length} active` : "On shift"}
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-[13px] text-ink-300">{dept.tagline}</p>

            <div className={cn(
              "mt-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px]",
              isWorking
                ? "border-emerald-400/20 bg-emerald-500/5 text-emerald-100"
                : "border-white/10 bg-white/[0.02] text-ink-200"
            )}>
              <span className="relative flex h-2 w-2">
                {isWorking && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", isWorking ? "bg-emerald-400" : "bg-ink-400")} />
              </span>
              <span className="font-medium">Right now:</span>
              <span className="truncate text-ink-300">{isWorking ? st.line : "On standby — ready for work."}</span>
            </div>

            <p className="mt-3 max-w-2xl text-[12px] italic leading-relaxed text-ink-500">"{dept.personality}"</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button size="sm" variant="primary">Assign new task</Button>
            <Button size="sm" variant="ghost">
              <Settings2 className="h-3.5 w-3.5" /> Settings
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Tasks today" value={st.completedTasksToday.toLocaleString()} icon={CheckCircle2} dept={dept} />
        <Stat label="Success rate" value={`${dept.stats.successRate}%`} icon={TrendingUp} dept={dept} />
        <Stat label="Avg response" value={dept.stats.avgResponseTime} icon={Clock} dept={dept} />
        <Stat label="Agents" value={String(dept.agents.length)} icon={Bot} dept={dept} />
        <Stat label="Tools" value={String(dept.integrations.length)} icon={Wrench} dept={dept} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Agents */}
        <GlassCard className="p-6" tilt={false}>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <Bot className="h-4 w-4 text-brand-300" /> Team members
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Specialized agents that handle work inside this department.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {dept.agents.map((a) => {
              const busy = runningTasks.some((t) => t.assignee === a.name);
              const tone = dept.id === "support" ? "cyan" : dept.id === "sales" ? "emerald" : dept.id === "marketing" ? "violet" : dept.id === "operations" ? "amber" : dept.id === "finance" ? "rose" : "brand";
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <Avatar name={a.name} tone={tone} size="md" status={busy ? "online" : a.status === "idle" ? "idle" : a.status === "busy" ? "busy" : "offline"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-white">{a.name}</div>
                    <div className="truncate text-[11px] text-ink-400">{a.role}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-500">
                      <span>{a.tasksCompleted.toLocaleString()} tasks</span>
                      <span>·</span>
                      <span>{a.successRate}% success</span>
                      {busy && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-300">working</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Tools */}
        <GlassCard className="p-6" tilt={false}>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <Wrench className="h-4 w-4 text-brand-300" /> Connected tools
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Every tool this department has permission to use.
          </p>
          <div className="mt-4 space-y-1.5">
            {dept.integrations.map((t) => (
              <div key={t} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: dept.color.primary }} />
                <span className="flex-1 text-[12px] text-ink-200">{toolName(t)}</span>
                <Badge tone="emerald"><CheckCircle2 className="h-2.5 w-2.5" /> Connected</Badge>
              </div>
            ))}
            <button className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 py-2 text-[11.5px] text-ink-400 hover:border-white/20 hover:text-white">
              + Connect new tool
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Recent activity */}
      <div className="mt-6">
        <GlassCard className="p-6" tilt={false}>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <ActivityIcon className="h-4 w-4 text-brand-300" /> Recent activity
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Live tool calls and handoffs from this department.
          </p>
          <div className="mt-4 space-y-1.5">
            {recentCalls.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/10 py-8 text-center text-[12px] italic text-ink-500">
                No recent activity yet — assign a task to watch this department work.
              </div>
            )}
            {recentCalls.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px]">
                {c.status === "running" ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                    <Clock className="h-3.5 w-3.5 text-brand-300" />
                  </motion.div>
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                )}
                <span className="text-ink-100">{c.toolName}</span>
                <span className="text-ink-500">—</span>
                <span className="truncate text-ink-400">
                  {state.timeline.find((t) => t.metadata?.toolCallId === c.id)?.description ?? "Working…"}
                </span>
                <span className="ml-auto tabular-nums text-ink-500">
                  {c.duration ? `${Math.round(c.duration / 100) / 10}s` : "…"}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, dept }: { label: string; value: string; icon: any; dept: any }) {
  return (
    <GlassCard className="flex items-center gap-3 p-4" tilt={false}>
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset", dept.color.bg)}>
        <Icon className={cn("h-4 w-4", dept.color.text)} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
        <div className="text-[18px] font-semibold tabular-nums text-white">{value}</div>
      </div>
    </GlassCard>
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
