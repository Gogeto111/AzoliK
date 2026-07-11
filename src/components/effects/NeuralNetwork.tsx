import * as React from "react";
import { useMotionValue, useAnimationFrame, useReducedMotion } from "framer-motion";
import { useMouseParallax } from "@/lib/hooks";

type Node = { x: number; y: number; vx: number; vy: number; r: number };
const NODE_COUNT = 28;
const LINK_DIST = 130;

/**
 * Subtle neural-network visualization.
 * - Canvas based (GPU, single layer)
 * - Drifting nodes connected when near
 * - Mouse acts as a gentle attractor, creating alive, responsive feel
 * - Low opacity — ambience, not a feature
 */
export function NeuralNetwork() {
  const prefersReduced = useReducedMotion();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { x: mx, y: my } = useMouseParallax(1);
  const rafId = React.useRef<number>(0);
  const nodesRef = React.useRef<Node[]>([]);
  const dims = useMotionValue({ w: 0, h: 0 });

  React.useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dims.set({ w, h });

      // Re/seed nodes if needed
      if (nodesRef.current.length === 0) {
        nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.3 + 0.7,
        }));
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { w, h } = dims.get();
      ctx.clearRect(0, 0, w, h);

      // Mouse attractor (subtle)
      const mouseX = w / 2 + mx.get() * (w / 4);
      const mouseY = h / 2 + my.get() * (h / 4);

      const nodes = nodesRef.current;
      for (const n of nodes) {
        // drift
        n.x += n.vx;
        n.y += n.vy;
        // gentle pull to mouse
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 400) {
          const pull = 0.00008 * (400 - dist);
          n.vx += dx * pull;
          n.vy += dy * pull;
        }
        // damp
        n.vx *= 0.995;
        n.vy *= 0.995;
        // wrap
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.22;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(120,150,255,${alpha})`);
            grad.addColorStop(1, `rgba(167,139,250,${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(180,200,255,0.55)";
        ctx.shadowColor = "rgba(120,150,255,0.9)";
        ctx.shadowBlur = 8;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId.current = requestAnimationFrame(draw);
    };
    rafId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId.current);
    };
  }, [mx, my, dims, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-60"
    />
  );
}
