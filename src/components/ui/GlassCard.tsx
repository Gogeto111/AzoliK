import * as React from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

type GlassCardProps = HTMLMotionProps<"div"> & {
  tone?: "default" | "strong" | "subtle";
  interactive?: boolean;
  noPadding?: boolean;
  tilt?: boolean;
  hoverLift?: number;
  glow?: boolean;
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      tone = "default",
      interactive,
      noPadding,
      tilt = true,
      hoverLift = 4,
      glow = true,
      children,
      ...props
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();
    const cardRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => cardRef.current!);

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const rx = useSpring(rotateX, { stiffness: 350, damping: 28, mass: 0.6 });
    const ry = useSpring(rotateY, { stiffness: 350, damping: 28, mass: 0.6 });

    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const gx = useSpring(glareX, { stiffness: 220, damping: 24 });
    const gy = useSpring(glareY, { stiffness: 220, damping: 24 });
    const glareBg = useMotionTemplate`radial-gradient(240px circle at ${gx}% ${gy}%, rgba(255,255,255,0.10), transparent 40%)`;

    const borderX = useMotionValue(50);
    const borderY = useMotionValue(50);
    const bx = useSpring(borderX, { stiffness: 220, damping: 24 });
    const by = useSpring(borderY, { stiffness: 220, damping: 24 });
    const borderBg = useMotionTemplate`radial-gradient(260px circle at ${bx}% ${by}%, rgba(143,174,255,0.14), transparent 40%)`;

    const doTilt = !!(interactive && tilt && !prefersReduced);
    const showFX = !!(interactive && glow && !prefersReduced);

    const handleMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive || prefersReduced) return;
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        if (tilt) {
          rotateY.set((px - 0.5) * 3.5);
          rotateX.set(-(py - 0.5) * 3.5);
        }
        glareX.set(px * 100);
        glareY.set(py * 100);
        borderX.set(px * 100);
        borderY.set(py * 100);
      },
      [interactive, prefersReduced, tilt, rotateX, rotateY, glareX, glareY, borderX, borderY]
    );

    const handleLeave = React.useCallback(() => {
      rotateX.set(0);
      rotateY.set(0);
      glareX.set(50);
      glareY.set(50);
      borderX.set(50);
      borderY.set(50);
    }, [rotateX, rotateY, glareX, glareY, borderX, borderY]);

    const toneClass =
      tone === "strong" ? "glass-strong" : tone === "subtle" ? "glass-subtle" : "glass";

    return (
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={
          interactive && !prefersReduced
            ? { y: -hoverLift, transition: { type: "spring", stiffness: 380, damping: 26 } }
            : undefined
        }
        whileTap={
          interactive
            ? { scale: 0.995, y: -1, transition: { type: "spring", stiffness: 600, damping: 22 } }
            : undefined
        }
        initial={{ opacity: 0, y: 10, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.9 }}
        style={
          doTilt
            ? {
                rotateX: rx,
                rotateY: ry,
                transformStyle: "preserve-3d",
                transformPerspective: 1400,
              }
            : undefined
        }
        className={cn(
          toneClass,
          "group relative overflow-hidden rounded-2xl",
          !noPadding && "p-5",
          interactive && "cursor-pointer",
          "transition-shadow duration-300",
          className
        )}
        {...props}
      >
        {/* Border glow follows cursor on hover */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300",
            showFX ? "opacity-0 group-hover:opacity-100" : "opacity-0"
          )}
          style={{ background: borderBg as unknown as string }}
        />
        {/* Specular glass glare */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl mix-blend-overlay transition-opacity duration-300",
            doTilt ? "opacity-0 group-hover:opacity-100" : "opacity-0"
          )}
          style={{ background: glareBg as unknown as string }}
        />
        {/* Permanent top edge highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
        />
        {/* Subtle left/right edge lights */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-6 left-0 w-px"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-6 right-0 w-px"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)" }}
        />
        {/* Grounding shadow */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-px left-8 right-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)" }}
        />
        <div className="relative z-10">{children as React.ReactNode}</div>
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
