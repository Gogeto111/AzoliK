import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { HEALTH_DATA } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Heart, AlertTriangle } from "lucide-react";

export function BusinessHealth() {
  const score = 93;
  return (
    <GlassCard className="p-0">
      <div className="flex items-start justify-between p-5 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Business Health</h3>
            <Badge tone="emerald" dot>Healthy</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Aggregate AI performance across departments
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 px-5 pt-2">
        <span className="text-[44px] font-semibold leading-none tracking-tight text-gradient-brand">
          {score}
        </span>
        <div className="pb-1.5">
          <div className="flex items-center gap-1 text-[12.5px] font-medium text-emerald-300">
            <TrendingUp className="h-3.5 w-3.5" />
            +4 this week
          </div>
          <div className="text-[11.5px] text-ink-400">out of 100</div>
        </div>
      </div>

      <div className="h-[140px] w-full px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HEALTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g-health" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8a91a6", fontSize: 11 }} />
            <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: "#8a91a6", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(20,22,32,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                fontSize: 12,
                color: "#eef0f4",
                backdropFilter: "blur(12px)",
              }}
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="health"
              stroke="#10b981"
              strokeWidth={2.4}
              fill="url(#g-health)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-b-2xl border-t border-white/5 bg-white/[0.02]">
        <Insight icon={Heart} label="No critical issues" tone="emerald" />
        <Insight icon={AlertTriangle} label="1 warning" tone="amber" />
        <Insight icon={TrendingUp} label="3 improvements" tone="brand" />
      </div>
    </GlassCard>
  );
}

function Insight({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "emerald" | "amber" | "brand";
}) {
  const toneColor = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    brand: "text-brand-300",
  }[tone];
  return (
    <div className="flex items-center gap-2 bg-ink-900/60 px-4 py-3">
      <Icon className={cn("h-4 w-4 shrink-0", toneColor)} />
      <span className="text-[11.5px] font-medium text-ink-300">{label}</span>
    </div>
  );
}
