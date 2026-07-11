import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS } from "@/data/mockData";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const toneIcon = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};
const toneColor = {
  success: "text-emerald-300 bg-emerald-500/10 ring-emerald-400/20",
  info: "text-brand-300 bg-brand-500/10 ring-brand-400/20",
  warning: "text-amber-300 bg-amber-500/10 ring-amber-400/20",
  error: "text-rose-300 bg-rose-500/10 ring-rose-400/20",
};

export function Notifications() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  return (
    <GlassCard ref={ref} className="p-0" tilt={false}>
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-white">Notifications</h3>
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.2 }}
            className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500/15 px-1.5 text-[10px] font-semibold text-rose-300 ring-1 ring-inset ring-rose-400/20"
          >
            {NOTIFICATIONS.length}
          </motion.span>
        </div>
        <button className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white">
          <Bell className="h-3 w-3" />
          Mark all read
        </button>
      </div>

      <div className="divide-y divide-white/5">
        {NOTIFICATIONS.map((n, i) => {
          const Icon = toneIcon[n.type as keyof typeof toneIcon];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 * i }}
              whileHover={prefersReduced ? undefined : { x: 3, backgroundColor: "rgba(255,255,255,0.02)" }}
              className="group relative flex cursor-pointer items-start gap-3 px-5 py-3.5"
            >
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", toneColor[n.type as keyof typeof toneColor])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-ink-100">{n.title}</p>
                <span className="mt-1 block text-[11px] text-ink-500">{n.time}</span>
              </div>
              <motion.button
                initial={{ opacity: 0, x: -6 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <ArrowRight className="h-4 w-4 text-ink-400" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
