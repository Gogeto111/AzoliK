import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { workforceEngine } from "@/lib/engine";
import { Brain, Users, Package, FileCheck, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const typeIcon: Record<string, any> = {
  customer: Users,
  product: Package,
  policy: FileCheck,
  conversation: MessageSquare,
  preference: Settings,
  task: Brain,
};
const typeColor: Record<string, string> = {
  customer: "text-cyan-200 bg-cyan-500/10 ring-cyan-400/20",
  product: "text-emerald-200 bg-emerald-500/10 ring-emerald-400/20",
  policy: "text-amber-200 bg-amber-500/10 ring-amber-400/20",
  conversation: "text-violet-200 bg-violet-500/10 ring-violet-400/20",
  preference: "text-brand-200 bg-brand-500/10 ring-brand-400/20",
  task: "text-rose-200 bg-rose-500/10 ring-rose-400/20",
};
const deptColor: Record<string, string> = {
  support: "bg-cyan-400",
  sales: "bg-emerald-400",
  marketing: "bg-violet-400",
  operations: "bg-amber-400",
  finance: "bg-rose-400",
  hr: "bg-brand-400",
};

export function BusinessMemory() {
  const [expanded, setExpanded] = React.useState(false);
  const memory = workforceEngine.state.memory.slice(0, expanded ? 12 : 5);
  const totalEntries = workforceEngine.state.memory.length;

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Business Memory</h3>
            <Badge tone="violet">{totalEntries} entries</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            What every AI employee knows about your business
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-violet-700/10 text-violet-200 ring-1 ring-inset ring-violet-400/20">
          <Brain className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-px px-3 pb-3">
        <AnimatePresence initial={false}>
          {memory.map((m) => {
            const Icon = typeIcon[m.type] ?? Brain;
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset", typeColor[m.type] ?? typeColor.task)}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] text-ink-100">{m.key}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-500">
                    <span className={cn("h-1 w-1 rounded-full", deptColor[m.source] ?? "bg-white/20")} />
                    <span className="capitalize">{m.source}</span>
                    <span>·</span>
                    <span>{m.accessCount} recalls</span>
                    <span>·</span>
                    <span className={cn("tabular-nums", m.confidence > 0.9 ? "text-emerald-300" : "text-amber-300")}>
                      {Math.round(m.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="block w-full border-t border-white/[0.06] py-2.5 text-center text-[11.5px] font-medium text-ink-400 transition-colors hover:bg-white/[0.03] hover:text-white"
      >
        {expanded ? "Show less" : `Show all ${totalEntries} memories`}
      </button>
    </GlassCard>
  );
}
