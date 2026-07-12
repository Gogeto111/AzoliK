import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEngine } from "@/lib/engine";
import { softSpring, snappySpring } from "@/lib/motion";
import {
  IndianRupee, Users, ShoppingCart, Clock, MessageSquare,
  TrendingUp,
} from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: snappySpring },
};

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const from = displayed;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (value - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>{prefix}{displayed.toLocaleString()}</span>
  );
}

export default function Analytics() {
  const engine = useEngine();
  const m = engine.metrics;

  const kpis = [
    {
      label: "Today's Revenue",
      value: m.revenueGenerated,
      prefix: "₹",
      icon: IndianRupee,
      color: "text-emerald-300",
      bg: "from-emerald-500/30 to-emerald-700/10",
      delta: "+12%",
    },
    {
      label: "Customers Helped",
      value: m.customersHelped,
      icon: Users,
      color: "text-brand-300",
      bg: "from-brand-500/30 to-brand-700/10",
      delta: "+18%",
    },
    {
      label: "Orders Completed",
      value: m.ordersClosed,
      icon: ShoppingCart,
      color: "text-amber-300",
      bg: "from-amber-500/30 to-amber-700/10",
      delta: "+8%",
    },
    {
      label: "Hours Saved",
      value: Math.round(m.hoursSaved),
      suffix: "h",
      icon: Clock,
      color: "text-cyan-300",
      bg: "from-cyan-500/30 to-cyan-700/10",
      delta: "~12h/day",
    },
    {
      label: "Messages Answered",
      value: m.customersHelped + m.leadsClosed,
      icon: MessageSquare,
      color: "text-violet-300",
      bg: "from-violet-500/30 to-violet-700/10",
      delta: "+22%",
    },
  ];

  // Mini chart data (simulated sparkline)
  const sparkData = [12, 19, 14, 22, 18, 25, 30, 28, 35, 32, 40, 38];

  return (
    <motion.div
      className="space-y-6 pb-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariant}>
        <h1 className="text-[28px] font-semibold tracking-tight text-white">Analytics</h1>
        <p className="mt-1 text-[13px] text-ink-400">
          Real-time performance — powered by your AI workforce.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariant} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 + i * 0.03 }}
            >
              <GlassCard className="p-5" tilt={false}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${kpi.bg}`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-[11px] text-ink-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-semibold text-white mt-0.5">
                  <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ""} />
                  {kpi.suffix || ""}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp className="h-3 w-3 text-emerald-300" />
                  <span className="text-[11px] font-medium text-ink-300">{kpi.delta}</span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Mini Charts Row */}
      <motion.div variants={itemVariant} className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <GlassCard className="p-5" tilt={false}>
          <h3 className="text-[13px] font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-[120px] flex items-end gap-1.5">
            {sparkData.map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(val / 45) * 100}%` }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500/40 to-brand-400/80"
              />
            ))}
          </div>
        </GlassCard>

        {/* Messages Chart */}
        <GlassCard className="p-5" tilt={false}>
          <h3 className="text-[13px] font-semibold text-white mb-4">Messages Handled</h3>
          <div className="h-[120px] flex items-end gap-1.5">
            {[8, 14, 11, 18, 15, 22, 20, 28, 24, 32, 30, 38].map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(val / 42) * 100}%` }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500/40 to-cyan-400/80"
              />
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Department Breakdown */}
      <motion.div variants={itemVariant}>
        <GlassCard className="p-5" tilt={false}>
          <h3 className="text-[13px] font-semibold text-white mb-4">Department Performance</h3>
          <div className="space-y-3">
            {[
              { name: "Support", tasks: 142, completed: 138, color: "#22d3ee" },
              { name: "Sales", tasks: 64, completed: 61, color: "#34d399" },
              { name: "Finance", tasks: 28, completed: 28, color: "#fb7185" },
              { name: "Operations", tasks: 89, completed: 86, color: "#fbbf24" },
            ].map((dept, i) => (
              <div key={dept.name} className="flex items-center gap-3">
                <span className="w-24 text-[12px] text-ink-300 shrink-0">{dept.name}</span>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(dept.completed / dept.tasks) * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: dept.color }}
                  />
                </div>
                <span className="text-[11px] text-ink-400 w-16 text-right shrink-0">
                  {dept.completed}/{dept.tasks}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
