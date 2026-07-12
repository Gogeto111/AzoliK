import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db, collection, query, where, orderBy, limit as fsLimit, getDocs } from "@/lib/firebase";
import type { BusinessProfile, Department, Task, Conversation } from "@/lib/firebase";
import { useEngine, useEngineStart } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { softSpring, snappySpring, durations, ease } from "@/lib/motion";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { DemoOverlay } from "@/components/demo/DemoOverlay";
import type { DemoMetrics } from "@/components/demo/DemoOverlay";
import {
  Loader2,
  Check,
  AlertTriangle,
  Bell,
  Clock,
  Zap,
  Users,
  IndianRupee,
  Target,
  Bot,
  Wrench,
  MessageSquare,
  Play,
} from "lucide-react";
import type { DepartmentId } from "@/types";

/* ── helpers ────────────────────────────────────────────────────── */

const deptConfigMap = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));

const DEPT_ORDER: DepartmentId[] = [
  "support",
  "sales",
  "marketing",
  "operations",
  "finance",
  "hr",
];

function deptBadgeTone(
  id: DepartmentId
): "cyan" | "emerald" | "violet" | "rose" | "amber" | "brand" {
  switch (id) {
    case "support":
      return "cyan";
    case "sales":
      return "emerald";
    case "marketing":
      return "violet";
    case "finance":
      return "rose";
    case "operations":
      return "amber";
    case "hr":
      return "brand";
  }
}

function deptToneBadge(
  tone: "idle" | "working" | "handoff" | "done"
): { tone: "cyan" | "amber" | "emerald" | "muted"; label: string } {
  switch (tone) {
    case "working":
      return { tone: "cyan", label: "Working" };
    case "handoff":
      return { tone: "amber", label: "Handoff" };
    case "done":
      return { tone: "emerald", label: "Done" };
    default:
      return { tone: "muted", label: "Idle" };
  }
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Firestore data hook ────────────────────────────────────── */

interface DashboardData {
  business: BusinessProfile | null;
  departments: Department[];
  metrics: {
    revenueAssisted: number;
    customersHelped: number;
    appointmentsBooked: number;
    ordersClosed: number;
    hoursSaved: number;
  };
  activeTasks: Task[];
  attentionItems: any[];
  timeline: any[];
  inbox: Conversation[];
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const { business, profile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    business: null,
    departments: [],
    metrics: {
      revenueAssisted: 0,
      customersHelped: 0,
      appointmentsBooked: 0,
      ordersClosed: 0,
      hoursSaved: 0,
    },
    activeTasks: [],
    attentionItems: [],
    timeline: [],
    inbox: [],
    loading: true,
  });

  const fetchData = useCallback(async () => {
    if (!business?.id) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const [deptSnap, taskSnap, convSnap, invoiceSnap, leadSnap] =
        await Promise.all([
          getDocs(
            query(collection(db, "businesses", business.id, "departments"))
          ),
          getDocs(
            query(
              collection(db, "businesses", business.id, "tasks"),
              where("status", "in", ["pending", "in_progress", "waiting_approval"]),
              orderBy("createdAt", "desc"),
              fsLimit(20)
            )
          ),
          getDocs(
            query(
              collection(db, "businesses", business.id, "conversations"),
              where("status", "==", "open"),
              orderBy("lastMessageAt", "desc"),
              fsLimit(10)
            )
          ),
          getDocs(
            query(collection(db, "businesses", business.id, "invoices"))
          ),
          getDocs(
            query(collection(db, "businesses", business.id, "leads"))
          ),
        ]);

      const departments = deptSnap.docs.map((d) => d.data() as Department);
      const tasks = taskSnap.docs.map((t) => t.data() as Task);
      const conversations = convSnap.docs.map((c) => c.data() as Conversation);
      const invoices = invoiceSnap.docs.map((i) => i.data() as any);
      const leads = leadSnap.docs.map((l) => l.data() as any);

      const todayAnalytics: any = undefined;

      const activeTasks = tasks;
      const openConversations = conversations;

      const revenueAssisted =
        invoices?.reduce(
          (sum: number, inv: any) => sum + (inv.total || 0),
          0
        ) || 0;
      const customersHelped = openConversations.length;
      const appointmentsBooked = activeTasks.filter(
        (t: any) => t.metadata?.type === "appointment"
      ).length;
      const ordersClosed =
        invoices?.filter((inv: any) => inv.status === "paid").length || 0;
      const hoursSaved =
        todayAnalytics?.hoursSaved ||
        departments.reduce(
          (sum: number, d: any) =>
            sum + (d.stats?.completedToday || 0) * 0.25,
          0
        );

      const attentionItems = [
        ...activeTasks
          .filter((t: any) => t.status === "waiting_approval")
          .slice(0, 3)
          .map((t: any) => ({
            id: t.id,
            severity: "warn" as const,
            title: "Approval Needed",
            detail: t.title,
            at: new Date(t.createdAt).getTime(),
            kind: "approval",
          })),
        ...openConversations
          .filter((c: any) => c.unreadCount > 0)
          .slice(0, 2)
          .map((c: any) => ({
            id: c.id,
            severity: "info" as const,
            title: "New Message",
            detail: `${c.customerName}: ${c.lastMessage?.slice(0, 50)}...`,
            at: new Date(c.lastMessageAt).getTime(),
            kind: "message",
          })),
      ];

      const timeline = [
        ...activeTasks.slice(0, 5).map((t: any) => ({
          id: t.id,
          type: "tool_call" as const,
          title: t.title,
          description: `Task in ${t.department} department`,
          department: t.department,
          at: new Date(t.createdAt).getTime(),
          status:
            t.status === "completed"
              ? ("success" as const)
              : ("running" as const),
        })),
        ...openConversations.slice(0, 3).map((c: any) => ({
          id: c.id,
          type: "inbound" as const,
          title: `Message from ${c.customerName}`,
          description: c.lastMessage?.slice(0, 100) || "",
          department: c.department,
          at: new Date(c.lastMessageAt).getTime(),
          status: "info" as const,
        })),
      ].sort((a, b) => b.at - a.at);

      setData({
        business,
        departments,
        metrics: {
          revenueAssisted,
          customersHelped,
          appointmentsBooked,
          ordersClosed,
          hoursSaved: Math.round(hoursSaved),
        },
        activeTasks,
        attentionItems,
        timeline: timeline.slice(0, 12),
        inbox: openConversations,
        loading: false,
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, [business]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return data;
}

/* ── animation variants ──────────────────────────────────────── */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: snappySpring,
  },
};

/* ── Mission Control Dashboard ────────────────────────────────── */

export default function Dashboard() {
  useEngineStart();
  const engine = useEngine();
  const { business, profile } = useAuth();
  const supabase = useDashboardData();
  const [showGreeting, setShowGreeting] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [demoMetrics, setDemoMetrics] = useState<DemoMetrics | null>(null);
  const [animRevenue, setAnimRevenue] = useState(0);
  const [animSales, setAnimSales] = useState(0);
  const [animSupport, setAnimSupport] = useState(0);
  const animRef = useRef<number>(0);

  // Animate KPI counters when demo completes
  useEffect(() => {
    if (!demoMetrics) return;
    const duration = 700;
    const start = performance.now();
    const from = { r: 0, s: 0, c: 0 };
    const to = { r: demoMetrics.revenueChange, s: demoMetrics.salesChange, c: demoMetrics.supportChange };

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setAnimRevenue(Math.round(from.r + (to.r - from.r) * ease));
      setAnimSales(Math.round(from.s + (to.s - from.s) * ease));
      setAnimSupport(Math.round(from.c + (to.c - from.c) * ease));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [demoMetrics]);

  const userName = profile?.displayName?.split(" ")[0] || "there";

  const activeTask = engine.activeTasks[0];
  const activeToolCalls = activeTask
    ? engine.toolCalls.filter((tc) => activeTask.toolCalls.includes(tc.id))
    : [];

  if (supabase.loading) {
    return (
      <div className="space-y-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-white">
              Loading...
            </h1>
            <p className="mt-1 text-[13px] text-ink-400">
              Booting up Mission Control
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.02] ring-1 ring-inset ring-white/10 animate-pulse">
                <div className="h-5 w-5 rounded bg-white/10" />
              </div>
              <div className="min-w-0">
                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse mb-1" />
                <div className="h-8 bg-white/5 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const m = engine.metrics;
  const dm = demoMetrics;

  return (
    <motion.div
      className="space-y-6 pb-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Greeting Card ─────────────────────────────────────── */}
      <AnimatePresence>
        {showGreeting && (
          <GreetingCard
            userName={userName}
            onDismiss={() => setShowGreeting(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariant}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            Mission Control
          </h1>
          <p className="mt-1 text-[13px] text-ink-400">
            {supabase.business?.name || engine.businessName} — Your AI workforce in action
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDemo(true)}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            See Departments Work
          </Button>
          <Badge tone="emerald" dot pulse>
            {m.agentsWorking} agents working
          </Badge>
          <Badge tone="cyan" dot={m.tasksRunning > 0}>
            {m.tasksRunning} tasks running
          </Badge>
          <Badge tone="muted">
            {engine.departmentStatus
              ? Object.keys(engine.departmentStatus).length
              : 0}{" "}
            departments
          </Badge>
        </div>
      </motion.div>

      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <motion.div variants={itemVariant} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(
          [
            {
              label: "Revenue Generated",
              value: `₹${(m.revenueGenerated + animRevenue).toLocaleString()}`,
              icon: IndianRupee,
              fallback: supabase.metrics.revenueAssisted,
              prefix: "₹",
            },
            {
              label: "Leads Closed",
              value: (m.leadsClosed + animSales).toLocaleString(),
              icon: Target,
            },
            {
              label: "Customers Helped",
              value: (m.customersHelped + animSupport).toLocaleString(),
              icon: Users,
              fallback: supabase.metrics.customersHelped,
            },
            {
              label: "Hours Saved",
              value: `${Math.round(m.hoursSaved)}h`,
              icon: Clock,
              fallback: supabase.metrics.hoursSaved,
            },
            {
              label: "Automations",
              value: m.automationsCompleted.toLocaleString(),
              icon: Zap,
            },
          ] as const
        ).map((kpi, i) => {
          const displayValue =
            kpi.value === "₹0" && "fallback" in kpi && kpi.fallback
              ? `${"prefix" in kpi ? kpi.prefix : ""}${kpi.fallback.toLocaleString()}`
              : kpi.value === "0h" && "fallback" in kpi && kpi.fallback
                ? `${kpi.fallback}h`
                : kpi.value === "0" && "fallback" in kpi && kpi.fallback
                  ? String(kpi.fallback)
                  : kpi.value;
          return (
            <GlassCard key={i} tone="subtle">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] ring-1 ring-inset ring-white/10">
                  <kpi.icon className="h-5 w-5 text-brand-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-ink-400 uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {displayValue}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </motion.div>

      {/* ── Department Status Grid ────────────────────────────── */}
      <motion.div variants={itemVariant} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEPT_ORDER.map((id) => {
          const dept = deptConfigMap[id];
          const status = engine.departmentStatus[id];
          const badge = deptToneBadge(status.tone);
          const Icon = dept?.icon;
          return (
            <GlassCard key={id}>
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/10"
                  style={{
                    boxShadow: `0 0 20px ${dept?.color?.glow ?? "transparent"}`,
                  }}
                >
                  {Icon && (
                    <Icon
                      className="h-5 w-5"
                      style={{ color: dept.color.primary }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-white text-sm truncate">
                      {dept?.personName || dept?.name}
                    </h3>
                    <Badge
                      tone={badge.tone}
                      dot
                      pulse={status.tone === "working"}
                      size="xs"
                    >
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-400 mt-1 truncate">
                    {status.line}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-ink-500">
                      {dept?.personRole || `${dept?.name} Lead`}
                    </span>
                    <span className="text-ink-700">·</span>
                    <span className="text-[10px] text-ink-500">
                      {dept?.agents?.filter((a) => a.status === "active").length ??
                        0}{" "}
                      agents online
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </motion.div>

      {/* ── Live Execution + Tool Calls ───────────────────────── */}
      <motion.div variants={itemVariant} className="grid gap-4 lg:grid-cols-5">
        {/* Live Execution Panel */}
        <GlassCard className="lg:col-span-2" noPadding>
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Live Execution
              </h2>
              {activeTask && (
                <Badge tone="cyan" size="xs" dot pulse>
                  Running
                </Badge>
              )}
            </div>
            {activeTask ? (
              <div className="mt-1">
                <p className="text-xs text-ink-300 truncate">
                  {activeTask.title}
                </p>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${activeTask.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-ink-500">
                    {activeTask.assignee} ·{" "}
                    {deptConfigMap[activeTask.department]?.name}
                  </span>
                  <span className="text-[10px] text-ink-500">
                    {activeTask.progress}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-500 mt-1">No active tasks</p>
            )}
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {activeToolCalls.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/[0.06]" />
                <div className="space-y-3">
                  {activeToolCalls.map((tc) => (
                    <div
                      key={tc.id}
                      className="relative flex items-start gap-3"
                    >
                      <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-950 ring-1 ring-inset ring-white/10">
                        {tc.status === "running" ? (
                          <Loader2 className="h-3 w-3 text-brand-400 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-xs text-white truncate">
                          {tc.toolName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge tone={deptBadgeTone(tc.department)} size="xs">
                            {deptConfigMap[tc.department]?.name}
                          </Badge>
                          {tc.duration != null && (
                            <span className="text-[10px] text-ink-500">
                              {Math.round(tc.duration)}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTask ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                <p className="text-xs text-ink-500 mt-2">
                  Executing steps...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Bot className="h-8 w-8 text-ink-600" />
                <p className="text-xs text-ink-500 mt-2">
                  Waiting for incoming work
                </p>
                <p className="text-[10px] text-ink-600 mt-1">
                  Customer messages will appear here
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Tool Calls Feed */}
        <GlassCard className="lg:col-span-3" noPadding>
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Tool Calls</h2>
              <Badge tone="muted" size="xs">
                {engine.toolCalls.length} total
              </Badge>
            </div>
            <p className="text-[11px] text-ink-500 mt-0.5">
              Real-time activity across all departments
            </p>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
            {engine.toolCalls.slice(0, 15).map((tc) => (
              <div
                key={tc.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]">
                  {tc.status === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 text-brand-400 animate-spin" />
                  ) : (
                    <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white truncate">{tc.toolName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge tone={deptBadgeTone(tc.department)} size="xs">
                      {deptConfigMap[tc.department]?.name}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    tone={tc.status === "running" ? "brand" : "emerald"}
                    size="xs"
                  >
                    {tc.status === "running" ? "Running" : "Done"}
                  </Badge>
                  {tc.duration != null && (
                    <p className="text-[10px] text-ink-500 mt-0.5">
                      {Math.round(tc.duration)}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
            {engine.toolCalls.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <Wrench className="h-6 w-6 text-ink-600" />
                <p className="text-xs text-ink-500 mt-2">
                  No tool calls yet
                </p>
                <p className="text-[10px] text-ink-600 mt-1">
                  They'll stream in as work happens
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Attention Items ───────────────────────────────────── */}
      {engine.attention.length > 0 && (
        <motion.div variants={itemVariant} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Needs Attention
            </h2>
            <Badge tone="amber" size="xs">
              {engine.attention.length} items
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {engine.attention.map((item) => (
              <GlassCard key={item.id} interactive>
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.severity === "urgent"
                        ? "bg-rose-500/10"
                        : item.severity === "warn"
                          ? "bg-amber-500/10"
                          : "bg-brand-500/10"
                    }`}
                  >
                    {item.severity === "urgent" ? (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Bell className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">{item.detail}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge tone={deptBadgeTone(item.department)} size="xs">
                        {deptConfigMap[item.department]?.name}
                      </Badge>
                      <span className="text-[10px] text-ink-500">
                        {formatTimeAgo(item.at)}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs" className="shrink-0">
                    Review
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent Inbox (from Firestore) ──────────────────────── */}
      {supabase.inbox.length > 0 && (
        <motion.div variants={itemVariant} className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Open Conversations</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {supabase.inbox.slice(0, 4).map((conv: any) => (
              <GlassCard key={conv.id} interactive>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-inset ring-white/[0.06]">
                    <Users className="h-3.5 w-3.5 text-ink-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">
                      {conv.customerName}
                    </p>
                    <p className="text-[11px] text-ink-400 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  <span className="text-[10px] text-ink-500 shrink-0">
                    {new Date(conv.lastMessageAt).toLocaleTimeString()}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Demo Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {showDemo && (
          <DemoOverlay
            onComplete={(metrics) => setDemoMetrics(metrics)}
            onDismiss={() => setShowDemo(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
