"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: Brain, label: "Smart AI Agents", color: "text-brand-400" },
    { icon: Zap, label: "Instant Setup", color: "text-emerald-400" },
    { icon: Shield, label: "Secure & Private", color: "text-amber-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex flex-col"
    >
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 18 }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 ring-1 ring-inset ring-white/10"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
              Azolik
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-ink-300 mb-10"
          >
            Your AI workforce is ready to work. Let&apos;s get you set up in minutes.
          </motion.p>

          <div className="space-y-3">
            <Button
              size="lg"
              onClick={onContinue}
              className="w-full gap-3 bg-brand-500 hover:bg-brand-600 text-white font-medium py-4 rounded-xl transition-all"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-base">Get Started</span>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showFeatures ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-16 w-full max-w-2xl grid grid-cols-3 gap-4 text-center"
          >
            {features.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              >
                <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
                <p className="text-xs font-medium text-ink-300">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default WelcomeScreen;