import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * A soft colored spotlight that follows the cursor.
 * Creates depth by "lighting" the UI where the user is looking.
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export function CursorGlow() {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 });

  React.useEffect(() => {
    if (prefersReduced) return;
    // Skip on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const move = (e: MouseEvent) => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          x.set(e.clientX - 220);
          y.set(e.clientY - 220);
          raf = 0;
        });
      }
    };
    const leave = () => {
      x.set(-400);
      y.set(-400);
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [x, y, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-0 h-[440px] w-[440px] rounded-full"
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(95,131,255,0.10) 0%, rgba(139,92,246,0.05) 35%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}
