"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, Brain, Zap, CheckCircle2, Loader2, Sparkles,
  MessageSquare, Briefcase, BarChart3, CreditCard, Settings, Users,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface TrainingScreenProps {
  departments: string[];
  onComplete: () => void;
  onBack: () => void;
}

const DEPARTMENT_CONFIG = {
  support: { name: "Support", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/20", steps: ["Loading FAQs...", "Training responses...", "Connecting channels...", "Testing auto-replies..."] },
  sales: { name: "Sales", icon: Briefcase, color: "text-green-400", bg: "bg-green-500/20", steps: ["Loading products...", "Training lead scoring...", "Setting up quotes...", "Configuring payments..."] },
  marketing: { name: "Marketing", icon: BarChart3, color: "text-pink-400", bg: "bg-pink-500/20", steps: ["Analyzing brand voice...", "Creating content templates...", "Scheduling posts...", "Setting up analytics..."] },
  finance: { name: "Finance", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/20", steps: ["Loading tax rules...", "Setting up invoices...", "Configuring expenses...", "Connecting accounts..."] },
  operations: { name: "Operations", icon: Settings, color: "text-blue-400", bg: "bg-blue-500/20", steps: ["Syncing inventory...", "Setting up orders...", "Configuring vendors...", "Optimizing workflows..."] },
  hr: { name: "HR", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20", steps: ["Loading policies...", "Setting up onboarding...", "Configuring payroll...", "Creating job templates..."] },
};

export function TrainingScreen({ departments, onComplete, onBack }: TrainingScreenProps) {
  const [trainingProgress, setTrainingProgress] = useState<Record<string, number>>({});
  const [currentDeptIndex, setCurrentDeptIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);

  const deptKeys = departments;
  const currentDept = deptKeys[currentDeptIndex];

  useEffect(() => {
    if (isComplete || !currentDept) return;

    const config = DEPARTMENT_CONFIG[currentDept as keyof typeof DEPARTMENT_CONFIG];
    if (!config) return;

    const steps = config.steps;
    let stepIndex = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress >= 100) {
        progress = 100;
        stepIndex++;
        
        if (stepIndex >= steps.length) {
          clearInterval(interval);
          setTrainingProgress(prev => ({ ...prev, [currentDept]: 100 }));
          
          // Move to next department or complete
          if (currentDeptIndex >= deptKeys.length - 1) {
            setIsComplete(true);
            setGlobalProgress(100);
          } else {
            setCurrentDeptIndex(prev => prev + 1);
          }
        } else {
          progress = 0;
        }
      }
      
      setTrainingProgress(prev => ({ ...prev, [currentDept]: progress }));
      setGlobalProgress(Math.round(
        ((currentDeptIndex + progress / 100) / deptKeys.length) * 100
      ));
    }, 800 + Math.random() * 400);

    return () => clearInterval(interval);
  }, [currentDept, currentDeptIndex, deptKeys.length, isComplete]);

  const handleComplete = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950"
    >
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-900 border-b border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
          initial={{ width: 0 }}
          animate={{ width: `${globalProgress}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Azolik</h1>
              <p className="text-xs text-ink-400">Training your AI workforce</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">Step 9 of 10</p>
            <p className="text-xs text-ink-500">{Math.round(globalProgress)}% complete</p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl"
              >
                <GlassCard className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 ring-1 ring-inset ring-brand-500/30"
                    >
                      <Cpu className="h-9 w-9 text-brand-400" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        Training <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
                          {DEPARTMENT_CONFIG[currentDept as keyof typeof DEPARTMENT_CONFIG]?.name || "Department"}
                        </span>
                      </h2>
                      <p className="text-ink-400">AI agents are learning your business...</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {deptKeys.map((deptKey, index) => {
                      const config = DEPARTMENT_CONFIG[deptKey as keyof typeof DEPARTMENT_CONFIG];
                      if (!config) return null;
                      
                      const progress = trainingProgress[deptKey] || 0;
                      const isCurrent = index === currentDeptIndex;
                      const isDone = progress === 100 && index < currentDeptIndex;

                      return (
                        <motion.div
                          key={deptKey}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "group relative p-4 rounded-xl transition-all",
                            isCurrent ? "bg-brand-500/10 ring-1 ring-brand-500/20" : "bg-white/5",
                            isDone && "bg-emerald-500/5"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              config.bg
                            )}>
                              <config.icon className={cn("h-5 w-5", config.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{config.name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3, ease: "linear" }}
                                  />
                                </div>
                                <span className={cn(
                                  "text-sm font-mono tabular-nums",
                                  isDone ? "text-emerald-400" : "text-brand-400"
                                )}>
                                  {Math.round(progress)}%
                                </span>
                              </div>
                            </div>
                            {isDone && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex h-6 w-6 items-center justify-center text-emerald-400"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </motion.div>
                            )}
                          </div>

                          {isCurrent && (
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={Math.floor(progress / 25)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm text-ink-400 pl-13 font-mono"
                              >
                                {config.steps[Math.min(Math.floor(progress / 25), config.steps.length - 1)]}
                              </motion.p>
                            </AnimatePresence>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Optimizing neural pathways...</p>
                      <p className="text-sm text-ink-400">
                        {deptKeys.length - currentDeptIndex - 1} departments remaining
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center text-sm text-ink-400"
                >
                  <p>This usually takes 1-2 minutes. Grab a coffee ☕</p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl text-center"
              >
                <GlassCard className="p-8 sm:p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 18 }}
                    className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 ring-1 ring-inset ring-white/10"
                  >
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-3">
                    All Departments Online
                  </h2>
                  <p className="text-ink-300 mb-8 max-w-md mx-auto">
                    Your AI workforce is trained and ready to work. 
                    {departments.length} departments, {departments.length * 4} agents active.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {departments.map((deptKey) => {
                      const config = DEPARTMENT_CONFIG[deptKey as keyof typeof DEPARTMENT_CONFIG];
                      if (!config) return null;
                      return (
                        <motion.div
                          key={deptKey}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="p-3 rounded-xl bg-white/5 text-center"
                        >
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg mx-auto mb-2", config.bg)}>
                            <config.icon className={cn("h-5 w-5", config.color)} />
                          </div>
                          <p className="font-medium text-white text-sm">{config.name}</p>
                          <p className="text-xs text-emerald-400">✓ Active</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <Button
                    size="lg"
                    onClick={handleComplete}
                    className="w-full gap-3 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl ring-1 ring-inset ring-emerald-500/30"
                  >
                    <ArrowRight className="h-5 w-5" />
                    Open Mission Control
                  </Button>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

export default TrainingScreen;