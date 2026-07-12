"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { softSpring, durations } from "@/lib/motion";

interface JarvisTransitionProps {
  departments: string[];
  onComplete: () => void;
}

const DEPT_LABELS: Record<string, string> = {
  support: "Support",
  sales: "Sales",
  finance: "Finance",
  marketing: "Marketing",
  operations: "Operations",
  hr: "HR",
};

interface BootLine {
  id: string;
  text: string;
  isCheck: boolean;
  isTitle: boolean;
  isReady: boolean;
  isLaunching: boolean;
}

export function JarvisTransition({ departments, onComplete }: JarvisTransitionProps) {
  const [lines, setLines] = useState<BootLine[]>([]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const bootSequence: BootLine[] = [
      { id: "init", text: "Initializing Workspace...", isCheck: false, isTitle: true, isReady: false, isLaunching: false },
      { id: "firebase", text: "Connecting Firebase", isCheck: true, isTitle: false, isReady: false, isLaunching: false },
      { id: "memory", text: "Loading Business Memory", isCheck: true, isTitle: false, isReady: false, isLaunching: false },
      ...departments.slice(0, 5).map((dept) => ({
        id: `dept-${dept}`,
        text: `Activating ${DEPT_LABELS[dept] || dept}`,
        isCheck: true,
        isTitle: false,
        isReady: false,
        isLaunching: false,
      })),
      { id: "integrations", text: "Synchronizing Integrations", isCheck: true, isTitle: false, isReady: false, isLaunching: false },
      { id: "ready", text: "Mission Control Ready.", isCheck: false, isTitle: false, isReady: true, isLaunching: false },
      { id: "launch", text: "Launching...", isCheck: false, isTitle: false, isReady: false, isLaunching: true },
    ];

    let index = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleNext = () => {
      if (index >= bootSequence.length) return;
      const line = bootSequence[index];
      const delay = line.isTitle ? 400 : line.isReady ? 600 : line.isLaunching ? 500 : 450;

      timers.push(
        setTimeout(() => {
          setLines((prev) => [...prev, line]);
          index++;
          scheduleNext();
        }, delay)
      );
    };

    scheduleNext();

    const totalTime = bootSequence.reduce((acc, line) => {
      return acc + (line.isTitle ? 400 : line.isReady ? 600 : line.isLaunching ? 500 : 450);
    }, 0);

    timers.push(
      setTimeout(() => setFading(true), totalTime + 400)
    );

    timers.push(
      setTimeout(() => onComplete(), totalTime + 1200)
    );

    return () => timers.forEach(clearTimeout);
  }, [departments, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="w-full max-w-md px-8">
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ ...softSpring, duration: 0.35 }}
              className="mb-3"
            >
              {line.isTitle && (
                <p className="text-sm font-mono text-white/90 tracking-wide">
                  {line.text}
                </p>
              )}

              {line.isCheck && (
                <div className="flex items-center gap-2.5">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
                  </motion.div>
                  <span className="text-sm font-mono text-white/70">
                    {line.text}
                  </span>
                </div>
              )}

              {line.isReady && (
                <p className="text-sm font-mono text-emerald-400 tracking-wide mt-1">
                  {line.text}
                </p>
              )}

              {line.isLaunching && (
                <p className="text-sm font-mono text-white/90 tracking-wide mt-1">
                  {line.text}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
