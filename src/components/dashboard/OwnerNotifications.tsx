import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  CalendarClock,
  TrendingUp,
  Receipt,
  ShoppingBag,
  Reply,
  Bell,
} from "lucide-react";

const ICONS = {
  order: ShoppingBag,
  appointment: CalendarClock,
  lead: TrendingUp,
  payment: Receipt,
  reply: Reply,
  expense: Receipt,
  review: CheckCircle2,
} as const;

const ICON_TONE = {
  order: "text-emerald-200 bg-emerald-500/10 ring-emerald-400/20",
  appointment: "text-violet-200 bg-violet-500/10 ring-violet-400/20",
  lead: "text-brand-200 bg-brand-500/10 ring-brand-400/20",
  payment: "text-amber-200 bg-amber-500/10 ring-amber-400/20",
  reply: "text-cyan-200 bg-cyan-500/10 ring-cyan-400/20",
  expense: "text-rose-200 bg-rose-500/10 ring-rose-400/20",
  review: "text-ink-200 bg-white/10 ring-white/20",
} as const;

const LABEL = {
  order: "Order completed",
  appointment: "Appointment booked",
  lead: "New lead",
  payment: "Payment received",
  reply: "Reply sent",
  expense: "Expense logged",
  review: "Review captured",
} as const;

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function OwnerNotifications() {
  const state = useEngine();
  const deptById = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 10000);
    return () => window.clearInterval(id);
  }, []);

  const items = state.results.slice(0, 7);
  const unread = items.length;

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">For You</h3>
            <Badge tone={unread ? "emerald" : "muted"}>{unread} new</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Things your workforce finished that are worth knowing
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-brand-200 ring-1 ring-inset ring-brand-400/20">
          <Bell className="h-4 w-4" />
        </div>
      </div>

      <div className="max-h-[360px] space-y-px overflow-y-auto px-3 pb-3">
        <AnimatePresence initial={false}>
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-[12px] italic text-ink-500">
              Your workforce is still warming up — results will appear here.
            </div>
          )}
          {items.map((r, i) => {
            const Icon = ICONS[r.icon] ?? CheckCircle2;
            const dept = deptById[r.department];
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: "spring", stiffness: 380, damping: 30, delay: i * 0.03 }}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03]"
              >
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", ICON_TONE[r.icon])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
                      <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                      {LABEL[r.icon]}
                    </span>
                    <span className="text-[10px] tabular-nums text-ink-500">
                      {timeAgo(r.at)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-200">{r.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-ink-400">{r.detail}</div>
                  {dept && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-ink-500">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: dept.color.primary }}
                      />
                      Closed by {dept.name}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-3">
        <div className="flex items-center justify-between text-[11px] text-ink-400">
          <span>Your people only interrupt you when it matters.</span>
          <button className="text-ink-300 hover:text-white">Open inbox →</button>
        </div>
      </div>
    </GlassCard>
  );
}
