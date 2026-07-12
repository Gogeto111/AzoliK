"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, MessageSquare, CreditCard, Package, Shield } from "lucide-react";
import { softSpring } from "@/lib/motion";

interface GreetingCardProps {
  userName: string;
  onDismiss: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const SUMMARY_ITEMS = [
  { icon: MessageSquare, text: "12 customer messages answered", color: "text-cyan-400" },
  { icon: CreditCard, text: "3 payment links generated", color: "text-amber-400" },
  { icon: Package, text: "Inventory synchronized", color: "text-violet-400" },
  { icon: Shield, text: "No urgent issues require your attention", color: "text-emerald-400" },
];

export function GreetingCard({ userName, onDismiss }: GreetingCardProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 500);
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={softSpring}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-6"
        >
          {/* Subtle gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {getGreeting()}, {userName}.
                </h2>
                <p className="text-sm text-ink-300 mt-1">
                  While you were away...
                </p>
              </div>
              <button
                onClick={() => {
                  setVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className="text-ink-500 hover:text-ink-300 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {SUMMARY_ITEMS.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...softSpring, delay: 0.3 + i * 0.12 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.4 + i * 0.12 }}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
                  </motion.div>
                  <span className="text-sm text-white/80">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
