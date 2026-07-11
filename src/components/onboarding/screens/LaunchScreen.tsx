"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Sparkles, Zap, Shield, Brain, Users, 
  Briefcase, BarChart3, CreditCard, Settings, Cpu, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface LaunchScreenProps {
  departments: string[];
  onComplete: () => void;
}

const DEPARTMENT_CONFIG = {
  support: { name: "Support", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/20" },
  sales: { name: "Sales", icon: Briefcase, color: "text-green-400", bg: "bg-green-500/20" },
  marketing: { name: "Marketing", icon: BarChart3, color: "text-pink-400", bg: "bg-pink-500/20" },
  finance: { name: "Finance", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/20" },
  operations: { name: "Operations", icon: Settings, color: "text-blue-400", bg: "bg-blue-500/20" },
  hr: { name: "HR", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20" },
};

export function LaunchScreen({ departments, onComplete }: LaunchScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-advance after animation
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 15 }}
            className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 ring-1 ring-inset ring-white/10"
          >
            <CheckCircle2 className="h-14 w-14 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4"
          >
            Your AI Workforce is{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Ready!
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg text-ink-300 mb-10 max-w-lg mx-auto"
          >
            All departments are online and your AI agents are ready to work. 
            Your business now runs on autopilot.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-10"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {departments.map((deptKey) => {
                const config = DEPARTMENT_CONFIG[deptKey as keyof typeof DEPARTMENT_CONFIG];
                if (!config) return null;
                return (
                  <motion.div
                    key={deptKey}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + Math.random() * 0.2, type: "spring", stiffness: 200, damping: 20 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      "border-emerald-500/30 bg-emerald-500/10"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg mx-auto mb-2", config.bg)}>
                      <config.icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <p className="font-medium text-white">{config.name}</p>
                    <p className="text-xs text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Online
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Button
              size="lg"
              onClick={onComplete}
              className="w-full sm:w-auto gap-3 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl ring-1 ring-inset ring-emerald-500/30"
            >
              <ArrowRight className="h-5 w-5" />
              Open Mission Control
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
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
                transition={{ delay: 1.6 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
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
          Welcome to the future of business operations. 🚀
        </p>
      </footer>
    </motion.div>
  );
}

export default LaunchScreen;