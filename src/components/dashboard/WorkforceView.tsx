import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { DEPARTMENTS } from "@/data/departments";
import { useEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Bot, Briefcase, CheckCircle2, PauseCircle } from "lucide-react";

const TONE_CLASS: Record<string, string> = {
  idle: "bg-ink-400",
  working: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  handoff: "bg-brand-300 shadow-[0_0_8px_rgba(143,174,255,0.9)]",
  done: "bg-emerald-300",
};

const IDLE_LINE: Record<string, string> = {
  support: "Inbox monitored 24/7",
  sales: "Pipeline warm",
  marketing: "Content calendar ready",
  operations: "Fulfilment running",
  finance: "Books reconciled",
  hr: "On standby",
};

export function WorkforceView() {
  const navigate = useNavigate();
  const state = useEngine();

  const totalAgents = DEPARTMENTS.reduce((s, d) => s + d.agents.length, 0);
  const activeDepts = DEPARTMENTS.filter((d) => d.status === "active").length;

  return (
    <GlassCard className="p-0" tilt={false}>
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">Your Departments</h3>
            <Badge tone="emerald" dot pulse>{activeDepts}/6 working</Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">
            {totalAgents} agents across {DEPARTMENTS.length} departments · Click any department to manage
          </p>
        </div>
        <button
          onClick={() => navigate("/departments")}
          className="text-[11.5px] text-ink-400 transition-colors hover:text-white"
        >
          Manage →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-b-2xl bg-white/[0.04] md:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d, i) => {
          const Icon = d.icon;
          const running = state.activeTasks.filter((t) => t.department === d.id);
          const isWorking = running.some(
            (t) => t.status === "running" || t.status === "waiting_handoff"
          );
          const st = state.departmentStatus[d.id];
          const line = isWorking ? st.line : IDLE_LINE[d.id];
          const tone = isWorking ? st.tone : d.status === "active" ? "idle" : "idle";

          return (
            <motion.button
              key={d.id}
              onClick={() => navigate(`/departments/${d.id}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 26 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              className="group relative flex items-start gap-3 p-4 text-left transition-colors"
            >
              <span
                className="absolute inset-y-3 left-0 w-[2px] rounded-r-full"
                style={{ background: d.color.primary, boxShadow: `0 0 8px ${d.color.glow}` }}
              />
              <div
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                  d.color.bg
                )}
                style={isWorking ? { boxShadow: `0 0 14px ${d.color.glow}` } : undefined}
              >
                <Icon className={cn("h-[18px] w-[18px]", d.color.text)} strokeWidth={2} />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75",
                      (tone === "working" || tone === "handoff") && "animate-ping"
                    )}
                    style={{ background: d.color.primary }}
                  />
                  <span
                    className={cn("relative inline-flex h-2 w-2 rounded-full", TONE_CLASS[tone])}
                  />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-white">
                    {d.name}
                  </span>
                  {running.length > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-1.5 py-px text-[9.5px] font-medium text-ink-200">
                      {running.length} {running.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11.5px] text-ink-300">{line}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-ink-500">
                  <span className="flex items-center gap-1">
                    <Bot className="h-2.5 w-2.5" />
                    {d.agents.length} agents
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{st.completedTasksToday.toLocaleString()} done today</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isWorking ? (
                  <span className="text-[9.5px] font-medium uppercase tracking-wider text-emerald-300">
                    Working
                  </span>
                ) : d.status === "active" ? (
                  <span className="flex items-center gap-1 text-[9.5px] font-medium uppercase tracking-wider text-ink-400">
                    <CheckCircle2 className="h-3 w-3" />
                    online
                  </span>
                ) : d.status === "training" ? (
                  <span className="flex items-center gap-1 text-[9.5px] font-medium uppercase tracking-wider text-amber-300">
                    <PauseCircle className="h-3 w-3" />
                    training
                  </span>
                ) : (
                  <span className="text-[9.5px] font-medium uppercase tracking-wider text-ink-500">
                    {d.status}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );
}
