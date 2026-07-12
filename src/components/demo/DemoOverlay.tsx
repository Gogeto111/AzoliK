"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Briefcase, Calculator, Settings2,
  Check, Smartphone, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { softSpring, snappySpring } from "@/lib/motion";

interface DemoOverlayProps {
  onComplete: (metrics: DemoMetrics) => void;
  onDismiss: () => void;
}

export interface DemoMetrics {
  revenueChange: number;
  salesChange: number;
  supportChange: number;
  inventoryChange: number;
}

interface DeptCard {
  id: string;
  name: string;
  icon: any;
  color: string;
  glowColor: string;
  bg: string;
  action: string;
  active: boolean;
  done: boolean;
  handoff: boolean;
}

const DEPARTMENTS: Omit<DeptCard, "active" | "done">[] = [
  { id: "support", name: "Support", icon: MessageSquare, color: "text-cyan-400", glowColor: "rgba(34,211,238,0.4)", bg: "bg-cyan-500/20", action: "Analyzing customer request..." },
  { id: "sales", name: "Sales", icon: Briefcase, color: "text-emerald-400", glowColor: "rgba(52,211,153,0.4)", bg: "bg-emerald-500/20", action: "Recording sale..." },
  { id: "finance", name: "Finance", icon: Calculator, color: "text-amber-400", glowColor: "rgba(251,191,36,0.4)", bg: "bg-amber-500/20", action: "Generating payment link..." },
  { id: "operations", name: "Operations", icon: Settings2, color: "text-violet-400", glowColor: "rgba(139,92,246,0.4)", bg: "bg-violet-500/20", action: "Updating inventory..." },
];

export function DemoOverlay({ onComplete, onDismiss }: DemoOverlayProps) {
  const [phase, setPhase] = useState<"incoming" | "message" | "departments" | "reply" | "complete" | "exit">("incoming");
  const [depts, setDepts] = useState<DeptCard[]>(
    DEPARTMENTS.map((d) => ({ ...d, active: false, done: false, handoff: false }))
  );
  const [showMessage, setShowMessage] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [supportSteps, setSupportSteps] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    // Phase 1: Incoming pulse (0-2.5s)
    t(() => setPhase("message"), 2500);

    // Phase 2: Show message (2.5-4s)
    t(() => {
      setShowMessage(true);
    }, 500);

    // Phase 3: Start departments (4s)
    t(() => setPhase("departments"), 3500);

    // Support lights up at 4.0s
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 0 ? { ...d, active: true } : d));
    }, 4000);

    // Support steps (domino: each 800ms apart)
    t(() => setSupportSteps((prev) => [...prev, "Reading Business Knowledge"]), 5000);
    t(() => setSupportSteps((prev) => [...prev, "Checking Inventory"]), 5800);
    t(() => setSupportSteps((prev) => [...prev, "Updating Google Sheet"]), 6600);
    t(() => setSupportSteps((prev) => [...prev, "Generating Payment Link"]), 7400);

    // Support done at 8.2s — handoff glow pulse
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 0 ? { ...d, active: false, done: true, handoff: true } : d));
    }, 8200);

    // Sales lights up at 8.6s — clear Support handoff
    t(() => {
      setDepts((prev) => prev.map((d, i) => {
        if (i === 1) return { ...d, active: true };
        if (i === 0) return { ...d, handoff: false };
        return d;
      }));
    }, 8600);

    // Sales done at 10.0s (1.4s duration)
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 1 ? { ...d, active: false, done: true } : d));
    }, 10000);

    // Finance lights up at 10.4s (400ms after Sales finishes)
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 2 ? { ...d, active: true } : d));
    }, 10400);

    // Finance done at 11.8s (1.4s duration)
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 2 ? { ...d, active: false, done: true } : d));
    }, 11800);

    // Operations lights up at 12.2s (400ms after Finance finishes)
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 3 ? { ...d, active: true } : d));
    }, 12200);

    // Operations done at 13.6s (1.4s duration)
    t(() => {
      setDepts((prev) => prev.map((d, i) => i === 3 ? { ...d, active: false, done: true } : d));
    }, 13600);

    // Reply at 14.2s
    t(() => {
      setShowReply(true);
    }, 14200);

    // Complete at 16.5s
    t(() => setPhase("complete"), 16500);

    // Exit at 19.0s (2.5s hold on complete screen)
    t(() => setPhase("exit"), 19000);

    // Auto dismiss at 19.5s
    t(() => {
      onComplete({
        revenueChange: 549,
        salesChange: 1,
        supportChange: 1,
        inventoryChange: 1,
      });
      onDismiss();
    }, 19500);

    return clearTimers;
  }, [clearTimers, onComplete, onDismiss]);

  const handleDismiss = useCallback(() => {
    clearTimers();
    onComplete({
      revenueChange: 549,
      salesChange: 1,
      supportChange: 1,
      inventoryChange: 1,
    });
    onDismiss();
  }, [clearTimers, onComplete, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
    >
      {/* Ambient background pulse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.15, 0],
            scale: [0.5, 1.5, 2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-500/20"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.1, 0],
            scale: [0.5, 1.2, 1.8],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-500/15"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.08, 0],
            scale: [0.5, 1, 1.5],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-500/10"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6">

        {/* ── Phase: Incoming Customer Pulse ──────────────────── */}
        <AnimatePresence>
          {(phase === "incoming" || phase === "message") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={softSpring}
              className="flex flex-col items-center"
            >
              {/* Pulse ring */}
              <div className="relative mb-6">
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 h-16 w-16 rounded-full bg-brand-500/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                  className="absolute inset-0 h-16 w-16 rounded-full bg-brand-500/15"
                />
                <motion.div
                  animate={{ scale: [1, 1.2], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                  className="absolute inset-0 h-16 w-16 rounded-full bg-brand-500/10"
                />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 ring-1 ring-inset ring-brand-500/30">
                  <Smartphone className="h-7 w-7 text-brand-400" />
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...softSpring }}
                className="text-lg font-semibold text-white tracking-tight"
              >
                Incoming Customer...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-ink-400 mt-1"
              >
                WhatsApp · New message detected
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: WhatsApp Message ────────────────────────── */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={softSpring}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Shivansh</p>
                  <p className="text-[10px] text-ink-400">WhatsApp · just now</p>
                </div>
              </div>
              <div className="ml-11 max-w-xs rounded-2xl rounded-tl-sm bg-emerald-800/80 px-4 py-2.5">
                <p className="text-sm text-white">
                  Hi! Do you have chocolate cake available?
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Department Wake-Up Grid ──────────────────── */}
        <AnimatePresence>
          {(phase === "departments" || phase === "reply" || phase === "complete" || phase === "exit") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={softSpring}
              className="mb-8"
            >
              <div className="grid grid-cols-2 gap-3">
                {depts.map((dept, i) => {
                  const Icon = dept.icon;
                  return (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        scale: dept.active ? 1.02 : 1,
                      }}
                      transition={{ ...softSpring, delay: i * 0.1 }}
                      className="relative"
                    >
                      {/* Glow effect when active or handoff */}
                      <AnimatePresence>
                        {(dept.active || dept.handoff) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: dept.handoff ? [0.8, 0.3, 0.8] : 1,
                            }}
                            exit={{ opacity: 0 }}
                            transition={dept.handoff ? { duration: 0.4, repeat: 2, ease: "easeInOut" } : undefined}
                            className="absolute -inset-1 rounded-2xl"
                            style={{
                              background: `radial-gradient(circle at center, ${dept.glowColor}, transparent 70%)`,
                              filter: "blur(12px)",
                            }}
                          />
                        )}
                      </AnimatePresence>

                      <div
                        className={`relative rounded-xl border p-4 transition-all duration-500 ${
                          dept.active
                            ? "border-white/20 bg-white/[0.06]"
                            : dept.done
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
                            dept.active ? dept.bg : dept.done ? "bg-emerald-500/20" : "bg-white/[0.04]"
                          }`}>
                            {dept.active ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Zap className={`h-5 w-5 ${dept.color}`} />
                              </motion.div>
                            ) : dept.done ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                              >
                                <Check className="h-5 w-5 text-emerald-400" strokeWidth={3} />
                              </motion.div>
                            ) : (
                              <Icon className="h-5 w-5 text-ink-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium transition-colors duration-300 ${
                              dept.active || dept.done ? "text-white" : "text-ink-400"
                            }`}>
                              {dept.name}
                            </p>
                            <p className="text-[11px] text-ink-400 truncate">
                              {dept.active ? dept.action : dept.done ? "Complete" : "Waiting..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Support Steps */}
              <AnimatePresence>
                {supportSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 ml-1 space-y-1"
                  >
                    {supportSteps.map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={softSpring}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
                        <span className="text-xs text-ink-300">{step}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Reply Sent ──────────────────────────────── */}
        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={softSpring}
              className="mb-8 ml-auto max-w-xs"
            >
              <div className="rounded-2xl rounded-tr-sm bg-emerald-700/80 px-4 py-3">
                <p className="text-sm text-white leading-relaxed">
                  Yes! Chocolate Cake (500g) is available for <span className="font-semibold">₹549</span>.
                </p>
                <p className="text-sm text-white/80 mt-1.5">
                  Here's your payment link: <span className="text-cyan-300">pay.azolik.in/abc123</span>
                </p>
              </div>
              <p className="text-[10px] text-ink-500 mt-1 text-right">Delivered ✓✓</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase: Automation Complete ──────────────────────── */}
        <AnimatePresence>
          {phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={softSpring}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 ring-1 ring-inset ring-white/10"
              >
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </motion.div>

              <h2 className="text-2xl font-semibold text-white mb-2">
                Support Request Completed
              </h2>
              <p className="text-sm text-ink-400 mb-6">
                No human intervention required.
              </p>

              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                {[
                  { text: "Customer helped", color: "text-cyan-400" },
                  { text: "Payment prepared", color: "text-amber-400" },
                  { text: "Inventory updated", color: "text-violet-400" },
                  { text: "Sale secured", color: "text-emerald-400" },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...softSpring, delay: 0.2 + i * 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <Check className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={3} />
                    <span className="text-sm text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dismiss Button (always available) ──────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 flex justify-center"
        >
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="gap-2 text-ink-500 hover:text-white"
          >
            Skip
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
