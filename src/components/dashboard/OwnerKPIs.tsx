import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEngine } from "@/lib/engine";
import { TrendingUp, Users, Clock, Zap, IndianRupee, Calendar, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const KPIS = [
  { id: "revenue", label: "Revenue assisted", icon: IndianRupee, tone: "emerald" as const, get: (m: any) => Math.round(m.revenueGenerated), format: (n: number) => n.toLocaleString("en-IN"), trend: "today" },
  { id: "orders", label: "Orders closed", icon: ShoppingBag, tone: "amber" as const, get: (m: any) => m.ordersClosed, format: (n: number) => String(n), trend: "live" },
  { id: "appointments", label: "Appointments", icon: Calendar, tone: "violet" as const, get: (m: any) => m.appointmentsBooked, format: (n: number) => String(n), trend: "booked" },
  { id: "customers", label: "Customers helped", icon: Users, tone: "cyan" as const, get: (m: any) => m.customersHelped, format: (n: number) => n.toLocaleString("en-IN"), trend: "+18%" },
  { id: "hours", label: "Hours saved", icon: Clock, tone: "brand" as const, get: (m: any) => Math.round(m.hoursSaved * 10) / 10, format: (n: number) => `${n}h`, trend: "+22%" },
  { id: "automations", label: "Tasks handled", icon: Zap, tone: "rose" as const, get: (m: any) => m.automationsCompleted, format: (n: number) => n.toLocaleString("en-IN"), trend: "all time" },
];

const toneStyle = {
  emerald: "text-emerald-200 bg-emerald-500/10 ring-emerald-400/20",
  brand: "text-brand-200 bg-brand-500/10 ring-brand-400/20",
  violet: "text-violet-200 bg-violet-500/10 ring-violet-400/20",
  cyan: "text-cyan-200 bg-cyan-500/10 ring-cyan-400/20",
  amber: "text-amber-200 bg-amber-500/10 ring-amber-400/20",
  rose: "text-rose-200 bg-rose-500/10 ring-rose-400/20",
};

export function OwnerKPIs() {
  const state = useEngine();
  const m = state.metrics;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {KPIS.map((k, i) => {
        const Icon = k.icon;
        const value = k.get(m);
        return (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: "spring", stiffness: 260, damping: 26 }}
          >
            <GlassCard interactive={false} className="p-4" tilt={false} hoverLift={3}>
              <div className="flex items-start justify-between">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset", toneStyle[k.tone])}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex items-center gap-0.5 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[9.5px] font-medium text-ink-300">
                  {k.trend}
                </span>
              </div>
              <div className="mt-3">
                <motion.div
                  key={value}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[20px] font-semibold tracking-[-0.02em] tabular-nums text-white"
                >
                  {k.format(value)}
                </motion.div>
                <div className="mt-0.5 text-[11px] text-ink-400">{k.label}</div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
