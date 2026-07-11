import { useEffect, useState, useRef } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Track mouse position as normalized (-1..1) motion values with spring smoothing.
 * Returns a stable object — safe to use across many components without re-renders.
 */
export function useMouseParallax(strength = 1) {
  const prefersReduced = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 20, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 80, damping: 20, mass: 0.8 });

  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 2;
      targetY = ((e.clientY / window.innerHeight) - 0.5) * 2;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          rawX.set(targetX * strength);
          rawY.set(targetY * strength);
          raf = 0;
        });
      }
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength, prefersReduced, rawX, rawY]);

  return { x, y };
}

/**
 * Track the position of a pointer over a specific element — 0..1 normalized.
 */
export function usePointerTilt(maxDeg = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const rx = useSpring(rotateX, { stiffness: 300, damping: 22, mass: 0.6 });
  const ry = useSpring(rotateY, { stiffness: 300, damping: 22, mass: 0.6 });
  const gx = useSpring(glareX, { stiffness: 200, damping: 20 });
  const gy = useSpring(glareY, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          rotateY.set((px - 0.5) * maxDeg * 2);
          rotateX.set(-(py - 0.5) * maxDeg * 2);
          glareX.set(px * 100);
          glareY.set(py * 100);
          raf = 0;
        });
      }
    };
    const onLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
      glareX.set(50);
      glareY.set(50);
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxDeg, rotateX, rotateY, glareX, glareY]);

  return { ref, rotateX: rx, rotateY: ry, glareX: gx, glareY: gy };
}

export function useScrollProgress() {
  const progress = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      progress.set(scrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [progress]);
  return progress;
}

// Auto-stagger delays based on index, memoized once
export function useStaggerDelay(index: number, base = 0.04) {
  const [delay] = useState(() => index * base);
  return delay;
}
