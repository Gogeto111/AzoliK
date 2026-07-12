import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, Clock, Target, ShoppingBag, DollarSign, 
  Activity, BarChart3, LineChart, PieChart, ArrowUpRight, 
  ArrowDownRight, Minus, Calendar, Filter, Download, RefreshCw,
  Building2, MessageSquare, Briefcase, CreditCard, Settings, Zap
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { db, collection, query, where, orderBy as fsOrderBy, getDocs } from "@/lib/firebase";
import type { Department } from "@/lib/firebase";

interface AnalyticsData {
  date: string;
  revenueAssisted: number;
  customersHelped: number;
  appointmentsBooked: number;
  ordersClosed: number;
  hoursSaved: number;
  messagesAnswered: number;
  avgResponseTime: number;
  successRate: number;
  automationsCompleted: number;
  departmentStats: Record<string, any>;
}
import { cn } from "@/lib/utils";
import { 
  LineChart as LineChartComp, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as BarChartComp, 
  Bar, 
  PieChart as PieChartComp, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const COLORS = ["#5f76ff", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#a78bfa"];

interface AnalyticsPageProps {
  businessId?: string;
}

export function AnalyticsPage({ businessId: propBusinessId }: AnalyticsPageProps) {
  const { business } = useAuth();
  const businessId = propBusinessId || business?.id;
  
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");

  useEffect(() => {
    if (businessId) {
      fetchAnalytics();
      fetchDepartments();
    }
  }, [businessId, dateRange, granularity]);

  const fetchAnalytics = async () => {
    if (!businessId) return;
    try {
      const q = query(
        collection(db, "analytics_daily"),
        where("businessId", "==", businessId),
        fsOrderBy("date", "asc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data() as AnalyticsData);
      setAnalytics(data);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!businessId) return;
    try {
      const deptQuery = query(collection(db, "businesses", businessId, "departments"));
      const snap = await getDocs(deptQuery);
      setDepartments(snap.docs.map(d => d.data() as Department));
    } catch (error) {
      console.error("Departments fetch error:", error);
    }
  };

  // Aggregate metrics
  const metrics = useMemo(() => {
    if (!analytics.length) {
      return {
        revenueAssisted: 0,
        customersHelped: 0,
        appointmentsBooked: 0,
        ordersClosed: 0,
        hoursSaved: 0,
        messagesAnswered: 0,
        avgResponseTime: 0,
        successRate: 0,
        automationsCompleted: 0,
      };
    }

    return analytics.reduce((acc, day) => ({
      revenueAssisted: acc.revenueAssisted + (day.revenueAssisted ?? 0),
      customersHelped: acc.customersHelped + (day.customersHelped ?? 0),
      appointmentsBooked: acc.appointmentsBooked + (day.appointmentsBooked ?? 0),
      ordersClosed: acc.ordersClosed + (day.ordersClosed ?? 0),
      hoursSaved: acc.hoursSaved + (day.hoursSaved ?? 0),
      messagesAnswered: acc.messagesAnswered + (day.messagesAnswered ?? 0),
      avgResponseTime: acc.avgResponseTime + (day.avgResponseTime ?? 0),
      successRate: acc.successRate + (day.successRate ?? 0),
      automationsCompleted: acc.automationsCompleted + (day.automationsCompleted ?? 0),
    }), {
      revenueAssisted: 0,
      customersHelped: 0,
      appointmentsBooked: 0,
      ordersClosed: 0,
      hoursSaved: 0,
      messagesAnswered: 0,
      avgResponseTime: 0,
      successRate: 0,
      automationsCompleted: 0,
    });
  }, [analytics]);

  // Calculate averages
  const avgMetrics = useMemo(() => {
    const count = analytics.length || 1;
    return {
      avgResponseTime: metrics.avgResponseTime / count,
      successRate: metrics.successRate / count,
    };
  }, [analytics.length, metrics]);

  // Chart data
  const chartData = useMemo(() => {
    return analytics.map(day => ({
      date: new Date(day.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      revenue: day.revenueAssisted ?? 0,
      customers: day.customersHelped ?? 0,
      appointments: day.appointmentsBooked ?? 0,
      orders: day.ordersClosed ?? 0,
      hoursSaved: day.hoursSaved ?? 0,
      messages: day.messagesAnswered ?? 0,
      responseTime: day.avgResponseTime ?? 0,
      successRate: day.successRate ?? 0,
      automations: day.automationsCompleted ?? 0,
    }));
  }, [analytics]);

  const departmentStats = useMemo(() => {
    if (!analytics.length) return {};
    const latest = analytics[analytics.length - 1];
    return latest.departmentStats ?? {};
  }, [analytics]);

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatHours = (hours: number) => {
    if (hours >= 24) return `${(hours / 24).toFixed(1)}d`;
    return `${hours.toFixed(1)}h`;
  };

  const KPI_CARDS = [
    { 
      key: "revenueAssisted", 
      label: "Revenue Assisted", 
      value: formatNumber(metrics.revenueAssisted),
      icon: DollarSign, 
      color: "text-emerald-300", 
      bg: "bg-emerald-500/20",
      trend: "+12%",
      trendUp: true,
    },
    { 
      key: "customersHelped", 
      label: "Customers Helped", 
      value: metrics.customersHelped.toLocaleString(),
      icon: Users, 
      color: "text-brand-300", 
      bg: "bg-brand-500/20",
      trend: "+18%",
      trendUp: true,
    },
    { 
      key: "appointmentsBooked", 
      label: "Appointments Booked", 
      value: metrics.appointmentsBooked.toLocaleString(),
      icon: Target, 
      color: "text-violet-300", 
      bg: "bg-violet-500/20",
      trend: "+22%",
      trendUp: true,
    },
    { 
      key: "ordersClosed", 
      label: "Orders Closed", 
      value: metrics.ordersClosed.toLocaleString(),
      icon: ShoppingBag, 
      color: "text-amber-300", 
      bg: "bg-amber-500/20",
      trend: "+8%",
      trendUp: true,
    },
    { 
      key: "hoursSaved", 
      label: "Hours Saved", 
      value: formatHours(metrics.hoursSaved),
      icon: Clock, 
      color: "text-cyan-300", 
      bg: "bg-cyan-500/20",
      trend: "~12h/day",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-white">
              Analytics
            </h1>
            <p className="mt-1 text-[13px] text-ink-400">
              Real-time insights into your AI workforce performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchAnalytics} disabled={loading} className="gap-2">
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 + i * 0.03 }}
          >
            <GlassCard className="flex items-center gap-4 p-5" tilt={false}>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10", kpi.bg)}>
                <kpi.icon className={cn("h-5 w-5", kpi.color)} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] text-ink-400">{kpi.label}</div>
                <div className="mt-0.5 text-[22px] font-semibold text-white">{kpi.value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={cn("h-3 w-3", kpi.trendUp ? "text-emerald-300" : "text-rose-300")}>
                    {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  </span>
                  <span className="text-[11px] font-medium text-ink-300">{kpi.trend}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        {/* Main Chart */}
        <GlassCard className="p-6" tilt={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Activity className="h-4 w-4 text-brand-300" />
              Performance Trends
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as "day" | "week" | "month")}
                className="rounded-xl border border-white/10 bg-ink-900/50 px-3 py-1.5 text-[12px] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff20" 
                  fontSize={11} 
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#ffffff10" }}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={11} 
                  tick={{ fill: "#888" }}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "#0f0f1a", 
                    border: "1px solid #ffffff10", 
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)"
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                
                <Line
                  type="monotone"
                  dataKey="customers"
                  name="Customers Helped"
                  stroke="#5f76ff"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  yAxisId="right"
                />
                <Area
                  type="monotone"
                  dataKey="hoursSaved"
                  name="Hours Saved"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="#34d399"
                  fillOpacity={0.1}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Department Performance */}
          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white mb-4">
              <Building2 className="h-4 w-4 text-emerald-300" />
              Departments Active
            </h3>
            <div className="space-y-3">
              {departments.map((dept) => {
                const stats = departmentStats[dept.type] || { tasksToday: 0, completedToday: 0, successRate: 0 };
                const progress = stats.tasksToday > 0 ? (stats.completedToday / stats.tasksToday) * 100 : 0;
                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative p-4 rounded-xl transition-all group"
                    style={{ background: dept.config?.color?.bg || "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ring-white/15", dept.config?.color?.bg)}>
                          {dept.config?.icon && <dept.config.icon className={cn("h-5 w-5", dept.config.color?.text)} />}
                        </div>
                        <div>
                          <h4 className="text-[14.5px] font-semibold text-white">{dept.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                              {dept.enabled && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              )}
                              <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dept.enabled ? "bg-emerald-400" : "bg-ink-500")} />
                            </span>
                            <span className="text-[11px] font-medium text-ink-300">{dept.enabled ? "Online" : "Offline"}</span>
                          </div>
                        </div>
                      </div>
                      {dept.enabled && (
                        <Badge tone="emerald" dot size="sm" className="gap-1">
                          <Zap className="h-2.5 w-2.5" /> Active
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] text-ink-300">{stats.tasksToday} tasks today</span>
                        <span className="text-[11.5px] font-medium text-white">{stats.completedToday} completed</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-ink-400">
                        <span>Success rate: {stats.successRate.toFixed(1)}%</span>
                        <span>{progress.toFixed(0)}% progress</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {departments.length === 0 && (
                <div className="py-8 text-center text-[12px] italic text-ink-500">
                  No departments configured yet
                </div>
              )}
            </div>
          </GlassCard>

          {/* Additional Metrics */}
          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white mb-4">
              <MessageSquare className="h-4 w-4 text-cyan-300" />
              Communication Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="Messages Answered" 
                value={metrics.messagesAnswered.toLocaleString()} 
                icon={MessageSquare}
                color="text-cyan-300"
              />
              <MetricCard 
                label="Avg Response Time" 
                value={`${avgMetrics.avgResponseTime.toFixed(1)}s`} 
                icon={Clock}
                color="text-amber-300"
              />
              <MetricCard 
                label="Success Rate" 
                value={`${avgMetrics.successRate.toFixed(1)}%`} 
                icon={Target}
                color="text-emerald-300"
              />
              <MetricCard 
                label="Automations" 
                value={metrics.automationsCompleted.toLocaleString()} 
                icon={Zap}
                color="text-violet-300"
              />
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Department Deep Dive */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.15 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {departments.map((dept, i) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.12 + i * 0.05 }}
          >
            <GlassCard className="p-6" tilt={false} interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/15", dept.config?.color?.bg)}>
                    {dept.config?.icon && <dept.config.icon className={cn("h-5 w-5", dept.config.color?.text)} />}
                  </div>
                  <div>
                    <h4 className="text-[14.5px] font-semibold text-white">{dept.name}</h4>
                    <p className="text-[11px] text-ink-400">{dept.description}</p>
                  </div>
                </div>
                {dept.enabled && (
                  <Badge tone="emerald" dot size="sm">
                    <Zap className="h-2.5 w-2.5" /> Online
                  </Badge>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <MetricRow label="Tasks Today" value={departmentStats[dept.type]?.tasksToday ?? departmentStats[dept.type]?.tasks_today ?? 0} />
                <MetricRow label="Completed" value={departmentStats[dept.type]?.completedToday ?? departmentStats[dept.type]?.completed_today ?? 0} positive />
                <MetricRow label="Pending" value={(departmentStats[dept.type]?.tasksToday ?? departmentStats[dept.type]?.tasks_today ?? 0) - (departmentStats[dept.type]?.completedToday ?? departmentStats[dept.type]?.completed_today ?? 0)} />
                <MetricRow label="Avg Response" value={`${(departmentStats[dept.type]?.successRate ?? departmentStats[dept.type]?.success_rate ?? 0).toFixed(1)}s`} />
                <MetricRow label="Success Rate" value={`${(departmentStats[dept.type]?.successRate ?? departmentStats[dept.type]?.success_rate ?? 0).toFixed(1)}%`} positive />
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center gap-1.5"
                onClick={() => window.location.href = `/departments/${dept.id}`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                View Details
              </Button>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-[11px] text-ink-400">{label}</span>
      </div>
      <div className="text-[18px] font-semibold text-white">{value}</div>
    </div>
  );
}

function MetricRow({ label, value, positive }: { label: string; value: number | string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-ink-400">{label}</span>
      <span className={cn("font-medium", positive ? "text-emerald-300" : "text-white")}>{value}</span>
    </div>
  );
}

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default AnalyticsPage;