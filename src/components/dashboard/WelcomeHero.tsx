import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Sparkles, Activity, ArrowRight, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEngine, INDUSTRIES_META, switchIndustry, workforceEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { DEPARTMENTS } from "@/data/departments";

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

const TONE_DOT: Record<string, string> = {
  idle: "bg-ink-400",
  working: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  handoff: "bg-brand-300 shadow-[0_0_8px_rgba(143,174,255,0.9)]",
  done: "bg-emerald-300",
};

export function WelcomeHero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReduced = useReducedMotion();
  const state = useEngine();
  const [showIndustries, setShowIndustries] = React.useState(false);

  const owner = state.ownerName;
  const biz = state.businessName;
  const industryMeta = INDUSTRIES_META[state.industry];

  const onlineCount = DEPARTMENTS.filter((d) => d.status === "active").length;

  return (
    <GlassCard ref={ref} tone="strong" className="relative overflow-hidden p-0" tilt={false} hoverLift={0}>
      {/* Ambient animated glows */}
      <div className="pointer-events-none absolute inset-0 -z-[1]">
        <motion.div
          animate={prefersReduced ? {} : { x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          className="absolute -right-24 -top-28 h-[520px] w-[520px] rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(95,131,255,0.28), transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
          animate={prefersReduced ? {} : { x: [0, -28, 28, 0], y: [0, 28, -22, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          className="absolute -left-20 bottom-[-160px] h-[420px] w-[420px] rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(167,139,250,0.22), transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="relative z-10 grid gap-7 p-7 md:grid-cols-[1.5fr_1fr] md:items-start md:p-9">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.05 }}
            className="mb-4 flex flex-wrap items-center gap-2"
          >
            <Badge tone="brand" dot pulse>
              <Sparkles className="h-3 w-3" />
              {industryMeta.emoji} {biz}
            </Badge>
            <Badge tone="emerald" dot>
              <Activity className="h-3 w-3" />
              {onlineCount} departments online
            </Badge>
            <button
              onClick={() => setShowIndustries((s) => !s)}
              className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10.5px] font-medium text-ink-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <Building2 className="h-3 w-3" />
              Change business
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>

          {/* Industry switcher */}
          <AnimatePresenceDiv show={showIndustries}>
            <div className="mb-5 flex flex-wrap gap-2">
              {(Object.keys(INDUSTRIES_META) as Array<keyof typeof INDUSTRIES_META>).map((k) => {
                const meta = INDUSTRIES_META[k];
                const active = state.industry === k;
                return (
                  <button
                    key={k}
                    onClick={() => { switchIndustry(k); setShowIndustries(false); }}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-[12px] transition-all",
                      active
                        ? "border-brand-400/40 bg-brand-500/15 text-white ring-2 ring-brand-500/20"
                        : "border-white/10 bg-white/[0.02] text-ink-200 hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-base leading-none">{meta.emoji}</span>
                      {meta.name}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-ink-400">{meta.tagline}</div>
                  </button>
                );
              })}
            </div>
          </AnimatePresenceDiv>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 240, damping: 28, delay: 0.1 }}
            className="text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-white md:text-[40px]"
          >
            {timeOfDay()}, {owner}.
            <br />
            <span className="text-gradient-brand">Your workforce is on shift.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 240, damping: 28, delay: 0.18 }}
            className="mt-3 max-w-xl text-[14px] leading-[1.55] text-ink-300 text-pretty"
          >
            Most AIs work <span className="text-ink-200 line-through decoration-ink-500/60">with you</span>.{" "}
            <span className="font-medium text-white">Azolik works for you.</span>{" "}
            Six departments are handling customers, orders, payments and appointments right now —
            you only see what needs your attention.
          </motion.p>

          {/* Department working-now list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 240, damping: 28, delay: 0.26 }}
            className="mt-5 grid gap-1.5"
          >
            {DEPARTMENTS.map((d, i) => {
              const st = state.departmentStatus[d.id];
              const isActive = d.status === "active";
              const running = state.activeTasks.some(
                (t) => t.department === d.id && (t.status === "running" || t.status === "waiting_handoff")
              );
              const tone = running ? st?.tone ?? "working" : isActive ? "idle" : "idle";
              const line = running ? st?.line : d.status === "training" ? "Training on recent data" : d.status === "idle" ? "On standby" : STATUS_DEFAULT[d.id];
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                      d.color.bg
                    )}
                    style={running ? { boxShadow: `0 0 14px ${d.color.glow}` } : undefined}
                  >
                    <d.icon className={cn("h-4 w-4", d.color.text)} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className={cn("absolute inline-flex h-full w-full rounded-full", tone === "working" && "animate-ping opacity-70 " + TONE_DOT[tone], tone === "handoff" && "animate-ping opacity-70 " + TONE_DOT[tone])} />
                        <span className={cn("relative inline-flex h-2 w-2 rounded-full", TONE_DOT[tone])} />
                      </span>
                      <span className="text-[13px] font-semibold text-white">{d.name}</span>
                      <span className="text-[11px] text-ink-400">·</span>
                      <span className="truncate text-[11.5px] text-ink-300">{line}</span>
                    </div>
                  </div>
                  <div className="hidden text-right text-[10.5px] text-ink-500 sm:block">
                    {st?.completedTasksToday ?? 0} done today
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 240, damping: 28, delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center gap-2.5"
          >
            <Button size="lg" variant="primary" className="gap-2" onClick={() => workforceEngine.runOrderFlow()}>
              <Zap className="h-4 w-4" strokeWidth={2.4} />
              Assign new work
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Button>
            <div className="flex items-center gap-2 pl-2 text-[11.5px] text-ink-400">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </span>
              {state.metrics.agentsWorking} agents handling {state.metrics.tasksRunning} tasks
            </div>
          </motion.div>
        </div>

        {/* Today's Results card */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  Today's Results
                </div>
                <div className="mt-0.5 text-[12px] text-ink-400">
                  Updated live · no manual work required
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-700/10 text-emerald-200 ring-1 ring-inset ring-emerald-400/20">
                <Activity className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <ResultRow
                icon="✓"
                tone="cyan"
                label="Customers helped"
                value={state.metrics.customersHelped.toLocaleString("en-IN")}
              />
              <ResultRow
                icon="✓"
                tone="emerald"
                label="Orders closed"
                value={state.metrics.ordersClosed.toLocaleString("en-IN")}
              />
              <ResultRow
                icon="₹"
                tone="amber"
                label="Revenue assisted"
                value={`₹${Math.round(state.metrics.revenueGenerated).toLocaleString("en-IN")}`}
              />
              <ResultRow
                icon="📅"
                tone="violet"
                label="Appointments booked"
                value={state.metrics.appointmentsBooked.toLocaleString("en-IN")}
              />
              <ResultRow
                icon="⏱"
                tone="brand"
                label="Hours saved for you"
                value={`${Math.round(state.metrics.hoursSaved * 10) / 10}h`}
              />
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-3 text-[11.5px] text-ink-300">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] text-white">
                  <Sparkles className="h-3 w-3" />
                </span>
                New message from {state.inbox[0]?.customer.name ?? "a customer"} just arrived — Support is already on it.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
}

const STATUS_DEFAULT: Record<string, string> = {
  support: "Inbox monitored 24/7",
  sales: "Pipeline warm",
  marketing: "Content calendar ready",
  operations: "Fulfilment running",
  finance: "Books reconciled",
  hr: "On standby",
};

function ResultRow({
  icon, tone, label, value,
}: { icon: string; tone: "cyan" | "emerald" | "amber" | "violet" | "brand"; label: string; value: string }) {
  const colors = {
    cyan: "text-cyan-200 bg-cyan-500/10 ring-cyan-400/20",
    emerald: "text-emerald-200 bg-emerald-500/10 ring-emerald-400/20",
    amber: "text-amber-200 bg-amber-500/10 ring-amber-400/20",
    violet: "text-violet-200 bg-violet-500/10 ring-violet-400/20",
    brand: "text-brand-200 bg-brand-500/10 ring-brand-400/20",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2 ring-1 ring-inset ring-white/5"
    >
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset font-semibold", colors)}>
        {icon}
      </span>
      <span className="flex-1 text-[12.5px] text-ink-200">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="tabular-nums text-[15px] font-semibold text-white"
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

import { AnimatePresence } from "framer-motion";
function AnimatePresenceDiv({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="picker"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
