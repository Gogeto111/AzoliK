import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMouseParallax } from "@/lib/hooks";

type P = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  depth: number; // 0..1, affects parallax + speed
  color: string;
};

function seedParticles(count: number): P[] {
  const colors = [
    "rgba(143,174,255,0.55)",
    "rgba(196,181,253,0.45)",
    "rgba(103,232,249,0.4)",
    "rgba(255,255,255,0.55)",
  ];
  return Array.from({ length: count }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2.2 + 0.6,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 14,
    depth: Math.random(),
    color: colors[i % colors.length],
  }));
}

const MEMO: P[] = seedParticles(28);

/**
 * Lightly drifting dust/star particles — adds a subtle cinematic texture.
 * Parallax with mouse, no per-frame JS (CSS animations + motion value transform).
 */
export function Particles() {
  const prefersReduced = useReducedMotion();
  const { x, y } = useMouseParallax(14);
  if (prefersReduced) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {MEMO.map((p, i) => (
        <motion.span
          key={i}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            x,
            y,
            // Depth scaling: farther particles move less
            scale: 0.6 + p.depth * 0.8,
            opacity: 0.25 + p.depth * 0.5,
          }}
          transformTemplate={({ x: tx, y: ty, scale }) => {
            const factor = (1 - p.depth) * 0.6;
            return `translate3d(calc(${tx} * ${factor}px), calc(${ty} * ${factor}px), 0) scale(${scale})`;
          }}
          className="absolute rounded-full"
        >
          <span
            className="block h-full w-full rounded-full"
            style={{
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              animation: `azolik-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate, azolik-twinkle ${p.duration * 0.8}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        </motion.span>
      ))}
      <style>{`
        @keyframes azolik-float {
          0%   { transform: translate(0,0); }
          100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}20px, -30px); }
        }
        @keyframes azolik-twinkle {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
