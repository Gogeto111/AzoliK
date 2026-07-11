import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ACTIVITY_DATA } from "@/data/mockData";
import { TrendingUp } from "lucide-react";
import { useInView, motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-[12px] shadow-float">
      <div className="mb-1 font-medium text-ink-100">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-ink-300">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="capitalize">{p.dataKey}:</span>
          <span className="font-medium text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ActivityChart() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <GlassCard ref={ref} className="overflow-hidden p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">AI Activity</h3>
            <Badge tone="emerald" dot>Live</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Tasks & conversations across all departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-300">
            <span className="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(95,131,255,0.8)]" /> Tasks
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-ink-300">
            <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" /> Conversations
          </div>
        </div>
      </div>

      <div className="flex gap-4 px-5 pb-2 pt-1">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
          className="flex items-baseline gap-2"
        >
          <span className="text-[28px] font-semibold tracking-tight text-white">
            450
          </span>
          <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-300">
            <TrendingUp className="h-3 w-3" /> +18% vs yesterday
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="h-[240px] w-full px-2 pb-4"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={ACTIVITY_DATA}
            margin={{ top: 10, right: 14, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="g-tasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5f83ff" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#5f83ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-convos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 5"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a91a6", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a91a6", fontSize: 11 }}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)", strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="conversations"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#g-convos)"
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="#5f83ff"
              strokeWidth={2.4}
              fill="url(#g-tasks)"
              animationDuration={1800}
              animationEasing="ease-out"
              activeDot={{ r: 5, strokeWidth: 0, fill: "#fff", filter: "drop-shadow(0 0 6px rgba(95,131,255,0.8))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </GlassCard>
  );
}
