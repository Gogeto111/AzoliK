import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Building2, Workflow, Zap, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to Azolik",
    body: "Your AI workforce is already online. Six departments, forty-four specialized agents, all connected to your business. A 30-second tour.",
    tone: "from-brand-500/40 to-brand-700/10 text-brand-200",
    cta: "Start tour",
  },
  {
    icon: Building2,
    title: "Your AI Departments",
    body: "Support, Sales, Marketing, Operations, Finance, and HR — each is a team of specialized agents that work 24/7, collaborate, and hand off tasks just like humans do.",
    tone: "from-violet-500/40 to-violet-700/10 text-violet-200",
    cta: "Next",
  },
  {
    icon: Workflow,
    title: "Build automations visually",
    body: "Drag, drop, and connect agents to real tools. Every workflow shows live execution, reasoning steps, and results — no black boxes.",
    tone: "from-cyan-500/40 to-cyan-700/10 text-cyan-200",
    cta: "Next",
  },
  {
    icon: Zap,
    title: "Command everything",
    body: "Press ⌘K to jump anywhere. Press ⌘J to talk to Azolik. Ask in plain language — the AI knows your business, your tools, and your team.",
    tone: "from-emerald-500/40 to-emerald-700/10 text-emerald-200",
    cta: "Let's go",
  },
];

const ONBOARDED_KEY = "azolik:onboarded:v2";

export function Onboarding() {
  const [show, setShow] = React.useState(() => {
    try { return !window.localStorage.getItem(ONBOARDED_KEY); } catch { return true; }
  });
  const [step, setStep] = React.useState(0);
  const s = steps[step];
  const Icon = s.icon;
  const isLast = step === steps.length - 1;

  const dismiss = () => {
    try { window.localStorage.setItem(ONBOARDED_KEY, "1"); } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#07080c]/70 backdrop-blur-xl" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: -8, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-3xl border border-white/10 bg-[rgba(14,16,24,0.85)] p-8 shadow-float"
            style={{ backdropFilter: "blur(32px) saturate(180%)" }}
          >
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                key={step}
                initial={{ scale: 0.5, opacity: 0, rotate: -16 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn("relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/15", s.tone)}
              >
                <Icon className="h-6 w-6" />
                {step === 0 && (
                  <motion.span
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    className="pointer-events-none absolute -inset-2 rounded-3xl"
                    style={{ background: "radial-gradient(closest-side, rgba(95,131,255,0.55), transparent 70%)" }}
                  />
                )}
              </motion.div>

              <motion.h2
                key={`t-${step}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07, type: "spring", stiffness: 300, damping: 26 }}
                className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-white"
              >{s.title}</motion.h2>
              <motion.p
                key={`b-${step}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 26 }}
                className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-300 text-balance"
              >{s.body}</motion.p>

              <div className="mt-7 flex w-full items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === step ? "w-8 bg-gradient-to-r from-brand-400 to-violet-400" : "w-1.5 bg-white/15"
                      )}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => (isLast ? dismiss() : setStep(step + 1))}
                  className="gap-1.5"
                >
                  {s.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
