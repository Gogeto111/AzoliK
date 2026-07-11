import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { workforceEngine, useEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";
import { cn } from "@/lib/utils";
import { MessageSquare, Mail, Hash, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";
import { makeBrandBadge } from "@/components/ui/BrandBadge";
import type { IncomingMessage } from "@/lib/engine";

const Instagram = makeBrandBadge("Ig");

const CHANNEL_ICON: Record<IncomingMessage["customer"]["channel"], any> = {
  whatsapp: MessageSquare,
  email: Mail,
  instagram: Instagram,
  sms: Phone,
};

const CHANNEL_COLOR: Record<IncomingMessage["customer"]["channel"], string> = {
  whatsapp: "#25D366",
  email: "#EA4335",
  instagram: "#E1306C",
  sms: "#8faeff",
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function InboxFeed() {
  const state = useEngine();
  const deptById = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 1200);
    return () => window.clearInterval(id);
  }, []);

  // Pair each inbox message with a running task if exists
  const inbox = state.inbox.slice(0, 6);

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Customer Inbox</h3>
            {inbox.length > 0 && (
              <Badge tone="cyan" dot pulse>
                {inbox.length} live
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            Every message your AI employees are handling right now
          </p>
        </div>
      </div>

      <div className="max-h-[380px] space-y-px overflow-y-auto px-3 pb-3">
        <AnimatePresence initial={false}>
          {inbox.length === 0 && (
            <div className="px-4 py-8 text-center text-[12px] italic text-ink-500">
              Inbox clear — your workforce is waiting for the next message.
            </div>
          )}
          {inbox.map((m) => {
            // Find a task whose title starts with the customer name
            const task = state.activeTasks.find(
              (t) => t.title.startsWith(`${m.customer.name}:`) || t.title.includes(m.customer.name)
            );
            const assignedDept = task ? deptById[task.department] : deptById.support;
            const done = task?.status === "completed";
            const waitingForReply = !task || task.status === "queued";
            const ChannelIcon = CHANNEL_ICON[m.customer.channel];
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, x: -8, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="group rounded-lg px-3 py-2.5 hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-inset ring-white/10"
                    style={{ color: CHANNEL_COLOR[m.customer.channel] }}
                  >
                    <ChannelIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-medium text-white">
                        {m.customer.name}
                      </span>
                      <span className="rounded-full bg-white/[0.04] px-1.5 py-px text-[9px] uppercase tracking-wider text-ink-400">
                        {m.customer.channel}
                      </span>
                      <span className="ml-auto text-[10px] tabular-nums text-ink-500">
                        {timeAgo(m.receivedAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11.5px] text-ink-300">
                      "{m.text}"
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[10.5px]">
                      <span
                        className={cn(
                          "flex h-5 items-center gap-1 rounded-md px-1.5 ring-1 ring-inset",
                          assignedDept.color.bg,
                          assignedDept.color.text
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : waitingForReply ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <assignedDept.icon className="h-2.5 w-2.5" />
                        )}
                        {assignedDept.name}
                      </span>
                      <span className="text-ink-400">
                        {done
                          ? "Replied"
                          : task
                          ? `${task.progress}% · ${task.assignee}`
                          : "Assigning…"}
                      </span>
                    </div>
                  </div>
                  <button
                    title="Reply yourself"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
                {task && !done && (
                  <div className="mt-2 ml-11 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: assignedDept.color.primary, width: `${task.progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="border-t border-white/[0.06] px-5 py-3 text-[11px] text-ink-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-300" />
          Replies are drafted by your departments — you approve nothing unless they ask.
        </span>
      </div>
    </GlassCard>
  );
}
