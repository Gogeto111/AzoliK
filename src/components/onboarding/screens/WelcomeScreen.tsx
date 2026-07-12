"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Shield, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { signInWithGoogle, loading } = useAuth();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    onContinue();
  };

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
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full gap-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium py-4 rounded-xl transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-base">Continue with Google</span>
            </Button>

            <Button
              size="lg"
              onClick={onContinue}
              disabled={loading}
              variant="ghost"
              className="w-full gap-3 border-white/10 hover:border-brand-500/30 hover:bg-brand-500/10 text-white font-medium py-4 rounded-xl transition-all"
            >
              <Mail className="h-5 w-5" />
              <span className="text-base">Continue with Email</span>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="w-full gap-3 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium py-4 rounded-xl transition-all"
            >
              <Mail className="h-5 w-5" />
              <span className="text-base">Continue with Apple</span>
            </Button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-sm text-ink-500"
          >
            Already have a workspace?{" "}
            <button
              onClick={onContinue}
              className="text-brand-400 hover:text-brand-300 font-medium underline"
            >
              Sign In
            </button>
          </motion.p>

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