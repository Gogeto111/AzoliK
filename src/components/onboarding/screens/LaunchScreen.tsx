"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Sparkles, Zap, Shield, Brain, Users,
  Briefcase, BarChart3, CreditCard, Settings, Cpu, ArrowRight,
  MessageSquare, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface LaunchScreenProps {
  departments: string[];
  onComplete: () => void;
}

const DEPARTMENT_CONFIG = {
  support: { name: "Support", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/20", glow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]" },
  sales: { name: "Sales", icon: Briefcase, color: "text-green-400", bg: "bg-green-500/20", glow: "shadow-[0_0_30px_rgba(74,222,128,0.4)]" },
  marketing: { name: "Marketing", icon: BarChart3, color: "text-pink-400", bg: "bg-pink-500/20", glow: "shadow-[0_0_30px_rgba(244,114,182,0.4)]" },
  finance: { name: "Finance", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/20", glow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]" },
  operations: { name: "Operations", icon: Settings, color: "text-blue-400", bg: "bg-blue-500/20", glow: "shadow-[0_0_30px_rgba(96,165,250,0.4)]" },
  hr: { name: "HR", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20", glow: "shadow-[0_0_30px_rgba(52,211,153,0.4)]" },
};

export function LaunchScreen({ departments, onComplete }: LaunchScreenProps) {
  const [activatedDepts, setActivatedDepts] = useState<string[]>([]);
  const [showCta, setShowCta] = useState(false);
  const [allActive, setAllActive] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < departments.length) {
        setActivatedDepts(prev => [...prev, departments[index]]);
        index++;
      } else {
        clearInterval(interval);
        setAllActive(true);
        setTimeout(() => setShowCta(true), 600);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [departments]);

  const handleComplete = () => {
    // Redirect to Google Meet for scheduling a meeting
    window.open("https://meet.google.com/azolik-demo", "_blank");
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex flex-col"
    >
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl text-center"
        >
          {/* Header */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 ring-1 ring-inset ring-white/10"
          >
            <Cpu className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3"
          >
            {allActive ? (
              <>
                Your AI Workforce is{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  Ready!
                </span>
              </>
            ) : (
              <>
                Building Your{" "}
                <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  AI Workforce
                </span>
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-ink-400 mb-8"
          >
            {allActive
              ? "All departments are online and ready to work."
              : "Activating departments one by one..."}
          </motion.p>

          {/* Department Activation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {departments.map((deptKey, i) => {
              const config = DEPARTMENT_CONFIG[deptKey as keyof typeof DEPARTMENT_CONFIG];
              if (!config) return null;
              const isActivated = activatedDepts.includes(deptKey);
              const Icon = config.icon;

              return (
                <motion.div
                  key={deptKey}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isActivated ? 1 : 0.95,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.6 + i * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className={cn(
                    "relative p-4 rounded-xl border transition-all duration-500",
                    isActivated
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  {/* Glow effect on activation */}
                  <AnimatePresence>
                    {isActivated && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "absolute inset-0 rounded-xl",
                          config.glow
                        )}
                        style={{ filter: "blur(20px)" }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3 transition-all duration-500",
                      isActivated ? config.bg : "bg-white/[0.05]"
                    )}>
                      {isActivated ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Icon className={cn("h-6 w-6", config.color)} />
                        </motion.div>
                      ) : (
                        <Loader2 className="h-5 w-5 text-ink-500 animate-spin" />
                      )}
                    </div>

                    <p className={cn(
                      "font-medium transition-colors duration-300",
                      isActivated ? "text-white" : "text-ink-400"
                    )}>
                      {config.name}
                    </p>

                    <AnimatePresence mode="wait">
                      {isActivated ? (
                        <motion.p
                          key="active"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-emerald-400 flex items-center justify-center gap-1 mt-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Activated
                        </motion.p>
                      ) : (
                        <motion.p
                          key="pending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-ink-500 mt-1"
                        >
                          Pending...
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Button */}
          <AnimatePresence>
            {showCta && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <a
                  href="https://meet.google.com/azolik-demo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    onClick={onComplete}
                    className="w-full sm:w-auto gap-3 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl ring-1 ring-inset ring-emerald-500/30"
                  >
                    <ArrowRight className="h-5 w-5" />
                    Schedule Your Demo Meeting
                  </Button>
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mt-10 w-full max-w-2xl grid grid-cols-3 gap-4 text-center"
          >
            {[
              { icon: Zap, label: "Instant Replies", color: "text-yellow-400" },
              { icon: Shield, label: "24/7 Coverage", color: "text-blue-400" },
              { icon: Brain, label: "Always Learning", color: "text-purple-400" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
                <p className="text-xs font-medium text-ink-300">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      <footer className="p-4">
        <p className="text-xs text-center text-ink-500">
          Welcome to the future of business operations.
        </p>
      </footer>
    </motion.div>
  );
}

export default LaunchScreen;
