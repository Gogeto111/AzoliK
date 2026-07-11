import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Subtle floating/idle motion — cards gently hover.
 * Uses seed-based offset so nearby cards don't move in lock-step.
 */
export function Float({
  children,
  seed = 0,
  intensity = 4,
  duration = 5,
  className,
}: {
  children: React.ReactNode;
  seed?: number;
  intensity?: number;
  duration?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;
  const delay = (seed * 0.7) % duration;
  const xPhase = (seed * 1.3) % 2;
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      animate={{
        y: [-intensity * 0.4, intensity * 0.4, -intensity * 0.4],
        rotate: [-0.3, 0.3, -0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      }}
      style={{
        // horizontal drift via inline keyframes on a child span — keep this element single-axis
        // so it composes with other transforms (tilt, hover)
      }}
    >
      <motion.div
        animate={{ x: [-intensity * 0.25, intensity * 0.25, -intensity * 0.25] }}
        transition={{
          duration: duration * 1.3,
          delay: delay + xPhase,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Glowing energy pulse ring — used on active AI indicators */
export function EnergyPulse({
  color = "rgba(95,131,255,0.6)",
  size = 10,
  className,
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 ${size}px ${color}`,
          background: color.replace(/[\d.]+\)$/, "1)"),
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 ${size}px ${color}`,
          animation: "azolik-pulse-ring 1.8s cubic-bezier(0.22,1,0.36,1) infinite",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 ${size}px ${color}`,
          animation: "azolik-pulse-ring 1.8s cubic-bezier(0.22,1,0.36,1) infinite 0.6s",
        }}
      />
      <style>{`
        @keyframes azolik-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          80%  { transform: scale(2.4); opacity: 0;   }
          100% { transform: scale(2.4); opacity: 0;   }
        }
      `}</style>
    </span>
  );
}

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}
