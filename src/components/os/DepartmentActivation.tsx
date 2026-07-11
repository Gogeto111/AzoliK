import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAI } from "@/lib/aiStore";
import { DEPARTMENTS } from "@/data/mockData";
import { Sparkles, Bot, Blocks, Workflow, CheckCircle2, Zap, Database, Globe, Brain, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { icon: Bot, label: "Bootstrapping agents" },
  { icon: Blocks, label: "Connecting integrations" },
  { icon: Workflow, label: "Warming workflows" },
  { icon: Database, label: "Indexing knowledge" },
  { icon: Globe, label: "Syncing with external tools" },
  { icon: Brain, label: "Reasoning online" },
];

export function DepartmentActivation() {
  const ai = useAI();
  const navigate = useNavigate();
  const dept = DEPARTMENTS.find((d) => d.name === ai.activatingDept);
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!ai.activatingDept) {
      setStep(0);
      setDone(false);
      return;
    }
    let cancelled = false;
    setStep(0);
    setDone(false);
    let total = 0;
    STEPS.forEach((s, i) => {
      total += 0.6;
      window.setTimeout(() => { if (!cancelled) setStep(i + 1); }, total * 1000);
    });
    window.setTimeout(() => { if (!cancelled) setDone(true); }, (total + 0.4) * 1000);
    return () => { cancelled = true; };
  }, [ai.activatingDept]);

  const finish = () => {
    if (dept) {
      ai.dispatch({
        type: "LOG",
        item: {
          dept: dept.name,
          deptTone: dept.tone,
          agent: "System",
          message: `${dept.name} department is online with ${dept.agents} agents`,
          level: "success",
        },
      });
    }
    ai.dispatch({ type: "DEPT_ACTIVATED" });
    navigate("/departments");
  };

  return (
    <AnimatePresence>
      {dept && ai.activatingDept && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#07080c]/80 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: -8, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(14,16,24,0.85)] p-7 shadow-float"
            style={{ backdropFilter: "blur(32px) saturate(180%)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "pointer-events-none absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full blur-[80px]",
                dept.tone === "cyan" && "bg-cyan-500/40",
                dept.tone === "emerald" && "bg-emerald-500/40",
                dept.tone === "violet" && "bg-violet-500/40",
                dept.tone === "amber" && "bg-amber-500/40",
                dept.tone === "rose" && "bg-rose-500/40",
                dept.tone === "brand" && "bg-brand-500/40"
              )}
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-5">
                {[0, 1].map((i) => (
                  <motion.span
                    key={i}
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl",
                      dept.tone === "cyan" && "bg-cyan-500/30",
                      dept.tone === "emerald" && "bg-emerald-500/30",
                      dept.tone === "violet" && "bg-violet-500/30",
                      dept.tone === "amber" && "bg-amber-500/30",
                      dept.tone === "rose" && "bg-rose-500/30",
                      dept.tone === "brand" && "bg-brand-500/30"
                    )}
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: [1, 2.2, 2.2], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                  />
                ))}
                <motion.div
                  animate={done ? { scale: [1, 1.1, 1] } : { rotate: [0, 6, -6, 0] }}
                  transition={{ duration: done ? 0.6 : 2.2, repeat: done ? 0 : Infinity, ease: "easeInOut" }}
                  className={cn(
                    "relative flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/15",
                    dept.iconBg
                  )}
                >
                  <dept.icon className={cn("h-[30px] w-[30px]", dept.iconColor)} strokeWidth={1.8} />
                </motion.div>
              </div>

              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white">
                {done ? (
                  <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    {dept.name} is online
                  </motion.span>
                ) : (
                  `Waking up ${dept.name}…`
                )}
              </h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-400">
                {done
                  ? `${dept.agents} agents are online and processing ${dept.tasksToday.toLocaleString()} tasks/day. ${dept.metric.label} targets initialized.`
                  : "Spinning up agents, connecting tools, and warming workflows."}
              </p>

              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: done ? "100%" : `${Math.min(95, (step / STEPS.length) * 100)}%` }}
                  transition={{ duration: done ? 0.4 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <div className="mt-5 grid w-full gap-1 text-left">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const state = i < step ? "done" : i === step && !done ? "active" : "pending";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: state === "pending" ? 0.35 : 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 320, damping: 26 }}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                    >
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg",
                        state === "done" && "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20",
                        state === "active" && "bg-brand-500/15 text-brand-200 ring-1 ring-inset ring-brand-400/25",
                        state === "pending" && "bg-white/[0.03] text-ink-500"
                      )}>
                        {state === "done" ? <CheckCircle2 className="h-3.5 w-3.5" />
                         : state === "active" ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}><Sparkles className="h-3.5 w-3.5" /></motion.div>
                         : <Icon className="h-3.5 w-3.5" />}
                      </div>
                      <span className={cn("flex-1 text-[12.5px]", state === "done" ? "text-ink-200" : state === "active" ? "text-white" : "text-ink-500")}>{s.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              {done && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 24 }}
                  onClick={finish}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_-8px_rgba(59,91,255,0.6)]"
                >
                  Enter {dept.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
