import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SceneFX } from "@/components/effects";
import { useMouseParallax } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useEngineStart } from "@/lib/engine";

export function AppShell() {
  const location = useLocation();
  const { x: px, y: py } = useMouseParallax(18);
  // Runs for the lifetime of the app shell (not tied to any single route),
  // so the simulated workforce keeps ticking no matter which page you're on.
  useEngineStart();

  return (
    <div className="relative flex h-full w-full overflow-hidden ambient-bg noise-overlay">
      <SceneFX />

      {/* Parallax grid layer */}
      <motion.div
        style={{ x: px, y: py }}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] dot-grid opacity-25"
        transformTemplate={({ x, y }) => `translate3d(calc(${x}px * -0.3), calc(${y}px * -0.3), 0)`}
      />

      {/* Sidebar frame */}
      <motion.div
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, mass: 1, delay: 0.04 }}
        className="relative z-30 m-3 mr-0 rounded-2xl glass-strong shadow-float"
      >
        <Sidebar />
      </motion.div>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />

        <div className="relative flex-1 overflow-y-auto px-6 pb-10 pt-2 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.997, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, scale: 1.003, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.95 }}
              className={cn("mx-auto max-w-[1480px]")}
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px origin-left"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                style={{ background: "linear-gradient(90deg, transparent, rgba(143,174,255,0.55), rgba(167,139,250,0.45), transparent)" }}
              />
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
