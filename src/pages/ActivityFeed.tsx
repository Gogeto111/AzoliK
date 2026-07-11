import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEngine, workforceEngine } from "@/lib/engine";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bot, CheckCircle2, Clock, AlertCircle, MessageSquare, TrendingUp,
  Megaphone, Settings2, Calculator, Users, Zap, Activity, Shield,
  Filter, Search, Download, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEPT_LABELS: Record<string, string> = {
  support: "Support",
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
  finance: "Finance",
  hr: "HR",
};

const DEPT_COLORS: Record<string, string> = {
  support: "#22d3ee",
  sales: "#34d399",
  marketing: "#a78bfa",
  operations: "#fbbf24",
  finance: "#fb7185",
  hr: "#8faeff",
};

const EVENT_TYPES = [
  { id: "all", label: "All", icon: Activity },
  { id: "tool_call", label: "Tool Calls", icon: Bot },
  { id: "task_completed", label: "Tasks", icon: CheckCircle2 },
  { id: "handoff", label: "Handoffs", icon: Activity },
  { id: "inbound", label: "Inbound", icon: MessageSquare },
  { id: "decision", label: "Decisions", icon: AlertCircle },
  { id: "alert", label: "Alerts", icon: Shield },
  { id: "integration_sync", label: "Sync", icon: Zap },
];

export default function ActivityFeed() {
  const state = useEngine();
  const prefersReduced = useReducedMotion();
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const PAGE_SIZE = 25;

  const filteredEvents = React.useMemo(() => {
    let events = state.timeline;
    if (filter !== "all") events = events.filter((e) => e.type === filter);
    if (search) {
      const q = search.toLowerCase();
      events = events.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      );
    }
    return events;
  }, [state.timeline, filter, search]);

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const paginatedEvents = filteredEvents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = React.useMemo(() => ({
    total: state.timeline.length,
    toolCalls: state.timeline.filter((e) => e.type === "tool_call").length,
    completed: state.timeline.filter((e) => e.status === "success").length,
    running: state.timeline.filter((e) => e.status === "running").length,
    handoffs: state.timeline.filter((e) => e.type === "handoff").length,
  }), [state.timeline.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Feed"
        description="GitHub-style timeline of everything your AI workforce is doing. Every tool call, handoff, and decision — fully auditable."
        badge={{ label: "Live", tone: "emerald", dot: true, pulse: true }}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="glass">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" variant="primary">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filters
            </Button>
          </div>
        }
      />

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <StatItem label="Total Events" value={stats.total} icon={Activity} color="brand" />
        <StatItem label="Tool Calls" value={stats.toolCalls} icon={Bot} color="cyan" />
        <StatItem label="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" />
        <StatItem label="Running" value={stats.running} icon={Zap} color="amber" />
        <StatItem label="Handoffs" value={stats.handoffs} icon={Activity} color="violet" />
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 26 }}
      >
        <GlassCard className="p-4" tilt={false}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 focus-within:border-brand-400/30 focus-within:ring-2 focus-within:ring-brand-500/20">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity…"
                className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-ink-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setFilter(t.id); setPage(0); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
                    filter === t.id
                      ? "bg-white/[0.08] text-white"
                      : "text-ink-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 26 }}
      >
        <GlassCard className="overflow-hidden" tilt={false}>
          {paginatedEvents.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="h-12 w-12 text-ink-500 mx-auto mb-4" />
              <h3 className="text-[16px] font-medium text-white mb-1">
                {filter !== "all" || search ? "No matching events" : "No activity yet"}
              </h3>
              <p className="text-ink-400">
                {filter !== "all" || search ? "Try adjusting your filters" : "Your workforce will start working automatically."}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[32px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/10 to-transparent" />

              <div className="space-y-0">
                {paginatedEvents.map((event, i) => (
                  <TimelineEvent key={`${event.id}-${i}`} event={event} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
                  <div className="text-[12px] text-ink-400">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredEvents.length)} of {filteredEvents.length} events
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-[12px] text-ink-300 w-20 text-center">{page + 1} / {totalPages}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Live Indicator */}
      <GlassCard tone="subtle" className="flex items-center justify-between px-6 py-3.5 text-[12px] text-ink-400" tilt={false}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          </span>
          Live feed — events appear in real-time as your workforce executes
        </div>
        <Button variant="ghost" size="sm" className="text-ink-300 hover:text-white">
          <Menu className="h-3.5 w-3.5 mr-1" /> More options
        </Button>
      </GlassCard>
    </div>
  );
}

function TimelineEvent({ event, index }: { event: any; index: number }) {
  const timeAgo = formatTimeAgo(event.timestamp);
  const typeConfig = getEventConfig(event.type);
  const Icon = typeConfig.icon;
  const color = typeConfig.color;
  const dept = event.department ? DEPT_LABELS[event.department] : "System";
  const deptColor = event.department ? DEPT_COLORS[event.department] : "#888";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), type: "spring", stiffness: 280, damping: 26 }}
      className="flex gap-4 px-4 py-3 relative"
    >
      {/* Timeline dot & line */}
      <div className="relative flex-shrink-0 w-[64px]">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/5" style={{ color }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-white/[0.04]" />
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[12.5px] font-medium text-white truncate">{event.title}</span>
            {event.department && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/[0.04]" style={{ borderColor: deptColor }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: deptColor }} />
                {dept}
              </span>
            )}
          </div>
          <span className="text-[10px] text-ink-500 whitespace-nowrap">{timeAgo}</span>
        </div>
        <p className="mt-1 text-[11.5px] text-ink-400 truncate">{event.description}</p>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-ink-500">
          <StatusBadge status={event.status} />
          {event.metadata?.toolCallId && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.03] font-mono">Tool: {event.metadata.toolCallId.slice(-6)}</span>
          )}
          {event.metadata?.handoffId && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.03] font-mono">Handoff: {event.metadata.handoffId.slice(-6)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    success: { label: "✓ Completed", color: "text-emerald-300", bg: "bg-emerald-500/10" },
    running: { label: "⟳ Running", color: "text-brand-300", bg: "bg-brand-500/10" },
    info: { label: "ℹ Info", color: "text-ink-400", bg: "bg-white/5" },
    error: { label: "✗ Failed", color: "text-rose-300", bg: "bg-rose-500/10" },
    warning: { label: "⚠ Warning", color: "text-amber-300", bg: "bg-amber-500/10" },
  };
  const config = configs[status] || configs.info;
  return <span className={cn("px-2 py-0.5 rounded-full", config.color, config.bg)}>{config.label}</span>;
}

function getEventConfig(type: string) {
  const configs: Record<string, { icon: any; color: string; label: string }> = {
    tool_call: { icon: Bot, color: "text-brand-300", label: "Tool Call" },
    task_completed: { icon: CheckCircle2, color: "text-emerald-300", label: "Task Completed" },
    handoff: { icon: Activity, color: "text-amber-300", label: "Handoff" },
    inbound: { icon: MessageSquare, color: "text-cyan-300", label: "Inbound Message" },
    decision: { icon: AlertCircle, color: "text-violet-300", label: "Decision" },
    alert: { icon: Shield, color: "text-rose-300", label: "Alert" },
    integration_sync: { icon: Zap, color: "text-emerald-300", label: "Integration Sync" },
  };
  return configs[type] || { icon: Bot, color: "text-ink-400", label: "Event" };
}

function StatItem({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: "brand" | "emerald" | "cyan" | "amber" | "violet" }) {
  const colorMap: Record<"brand" | "emerald" | "cyan" | "amber" | "violet", string> = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
  };
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 text-[22px] font-semibold text-white">{value.toLocaleString()}</div>
      </div>
    </GlassCard>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}