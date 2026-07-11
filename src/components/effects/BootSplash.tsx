import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Cinematic OS boot — ~1s. Subtle, fast, confident.
 */
export function BootSplash({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = React.useState(true);
  const prefersReduced = useReducedMotion();

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, prefersReduced ? 200 : 1050);
    return () => window.clearTimeout(t);
  }, [onDone, prefersReduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07080c]"
        >
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <motion.div
              animate={prefersReduced ? {} : { scale: [0.9, 1.2, 0.9], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(59,91,255,0.35), transparent 65%)", filter: "blur(80px)" }}
            />
            <motion.div
              animate={prefersReduced ? {} : { scale: [1.1, 0.9, 1.1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.25), transparent 65%)", filter: "blur(80px)" }}
            />
          </motion.div>

          <div className="relative flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.08 }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8faeff] via-brand-500 to-brand-700 shadow-[0_20px_60px_-10px_rgba(59,91,255,0.75),inset_0_1px_0_rgba(255,255,255,0.3)]"
            >
              <Sparkles className="h-7 w-7 text-white" strokeWidth={2.4} />
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
              {!prefersReduced && (
                <>
                  <motion.span
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-brand-300/80"
                  />
                  <motion.span
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-brand-300/60"
                  />
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="text-[20px] font-semibold tracking-tight text-gradient-brand">Azolik</div>
              <div className="mt-1 text-[10.5px] uppercase tracking-[0.2em] text-ink-400">
                Hiring your AI workforce
              </div>
              <div className="mt-2 max-w-[220px] text-[11px] italic leading-snug text-ink-500">
                "Most AIs work with you. Azolik works for you."
              </div>
            </motion.div>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[2px] w-[140px] overflow-hidden rounded-full bg-white/10"
            >
              <motion.span
                animate={prefersReduced ? {} : { x: ["-100%", "100%"] }}
                transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand-300 to-transparent"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
