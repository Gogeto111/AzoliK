import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

type Ripple = { id: number; x: number; y: number };

/**
 * Global click ripple: a soft energy pulse radiating from every click.
 * Fast, subtle, satisfying — gives physical "press" feedback anywhere.
 */
export function ClickRipple() {
  const prefersReduced = useReducedMotion();
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (prefersReduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      // Don't fire on inputs/text to avoid distraction
      if (el.closest("input, textarea, [data-no-ripple]")) return;
      const id = ++idRef.current;
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((x) => x.id !== id));
      }, 700);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [prefersReduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 0.25, scale: 0, x: r.x - 4, y: r.y - 4 }}
            animate={{ opacity: 0, scale: 9, x: r.x - 4, y: r.y - 4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-2 w-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(143,174,255,0.15) 40%, transparent 70%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
