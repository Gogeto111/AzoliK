import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { RECENT_CONVERSATIONS } from "@/data/mockData";
import { MessageSquare, ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const deptTone = {
  Support: "bg-cyan-500/10 text-cyan-200 border-cyan-400/20",
  Sales: "bg-emerald-500/10 text-emerald-200 border-emerald-400/20",
  Operations: "bg-amber-500/10 text-amber-200 border-amber-400/20",
  Marketing: "bg-violet-500/10 text-violet-200 border-violet-400/20",
} as const;

export function RecentConversations() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  return (
    <GlassCard ref={ref} className="p-0" tilt={false}>
      <div className="flex items-center justify-between p-5 pb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-white">Recent Conversations</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Live across all your AI channels
          </p>
        </div>
        <button className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white">
          <MessageSquare className="h-3 w-3" />
          Inbox
        </button>
      </div>

      <div className="divide-y divide-white/5">
        {RECENT_CONVERSATIONS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: 12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 * i }}
            whileHover={prefersReduced ? undefined : { x: 3, backgroundColor: "rgba(255,255,255,0.02)" }}
            className="group relative flex cursor-pointer items-start gap-3 px-5 py-3.5"
          >
            <Avatar name={c.name} tone={c.tone} size="md" status={c.status} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13.5px] font-medium text-white">{c.name}</span>
                <span className="text-[11px] text-ink-500">· {c.channel}</span>
                <span
                  className={"ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium " + (deptTone as any)[c.dept]}
                >
                  {c.dept}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-ink-300">{c.message}</p>
              <span className="mt-1 block text-[11px] text-ink-500">{c.time}</span>
            </div>
            <motion.button
              initial={{ opacity: 0, x: -6 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="mt-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ArrowRight className="h-4 w-4 text-ink-400" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
