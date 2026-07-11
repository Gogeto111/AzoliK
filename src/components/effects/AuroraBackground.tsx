import * as React from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { useMouseParallax } from "@/lib/hooks";

/**
 * Cinematic aurora: multiple layered, slowly-moving conic/radial gradient blobs.
 * - GPU-friendly (transform + opacity only, animated via rAF on motion values)
 * - Paraxed with mouse movement for depth
 * - Slow organic drift so the scene breathes without drawing attention
 */
export function AuroraBackground() {
  const prefersReduced = useReducedMotion();
  const { x: mx, y: my } = useMouseParallax(40);

  // Organic time signal
  const t = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (prefersReduced) return;
    t.set(t.get() + delta * 0.00006);
  });

  // Derive gentle offsets for each layer from time
  const l1x = useTransform(() => Math.sin(t.get() * 1.0) * 30 + mx.get());
  const l1y = useTransform(() => Math.cos(t.get() * 0.7) * 24 + my.get());
  const l2x = useTransform(() => Math.sin(t.get() * -0.6 + 1.2) * 40 - mx.get() * 0.6);
  const l2y = useTransform(() => Math.cos(t.get() * 0.9 + 0.4) * 28 - my.get() * 0.6);
  const l3x = useTransform(() => Math.sin(t.get() * 0.4 + 2.3) * 26 + mx.get() * 0.3);
  const l3y = useTransform(() => Math.cos(t.get() * 0.5 + 1.7) * 34 + my.get() * 0.3);
  const l4x = useTransform(() => Math.sin(t.get() * -0.3 + 3.5) * 30 - mx.get() * 0.4);
  const l4y = useTransform(() => Math.cos(t.get() * 0.4 + 2.2) * 22 - my.get() * 0.4);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base deep gradient */}
      <div className="absolute inset-0 ambient-bg" />

      {/* Aurora blobs */}
      <motion.div
        style={{ x: l1x, y: l1y }}
        className="absolute left-[5%] top-[-10%] h-[55vh] w-[55vh] rounded-full"
      >
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(95,131,255,0.35), rgba(95,131,255,0) 70%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ x: l2x, y: l2y }}
        className="absolute right-[-5%] top-[10%] h-[60vh] w-[60vh] rounded-full"
      >
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(139,92,246,0.30), rgba(139,92,246,0) 70%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ x: l3x, y: l3y }}
        className="absolute bottom-[-15%] left-[20%] h-[65vh] w-[65vh] rounded-full"
      >
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(6,182,212,0.22), rgba(6,182,212,0) 70%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ x: l4x, y: l4y }}
        className="absolute bottom-[5%] right-[15%] h-[45vh] w-[45vh] rounded-full"
      >
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(236,72,153,0.18), rgba(236,72,153,0) 70%)",
          }}
        />
      </motion.div>

      {/* Subtle dot grid & vignette */}
      <div className="absolute inset-0 dot-grid opacity-[0.25]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,6,10,0.55) 100%)",
        }}
      />
    </div>
  );
}
