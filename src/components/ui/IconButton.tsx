import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

type IconButtonProps = {
  variant?: "default" | "ghost";
  size?: "sm" | "md" | "lg";
  title: string;
  pulse?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = "md", children, pulse, onClick, title }, ref) => {
    const prefersReduced = useReducedMotion();
    const inner = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => inner.current!);

    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const smx = useSpring(mx, { stiffness: 360, damping: 24, mass: 0.4 });
    const smy = useSpring(my, { stiffness: 360, damping: 24, mass: 0.4 });

    const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (prefersReduced) return;
      const el = inner.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 3);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 3);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };

    const sizeCls =
      size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
    const variantCls =
      variant === "ghost"
        ? "text-ink-300 hover:text-white hover:bg-white/[0.05]"
        : "glass text-ink-200 hover:text-white hover:bg-white/[0.04]";

    return (
      <motion.button
        ref={inner}
        title={title}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={prefersReduced ? { scale: 0.96 } : { scale: 0.9, transition: { type: "spring", stiffness: 500, damping: 20, mass: 0.5 } }}
        whileHover={prefersReduced ? undefined : { transition: { type: "spring", stiffness: 400, damping: 22 } }}
        style={{ x: smx, y: smy }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-colors select-none focus-visible:ring-focus",
          sizeCls,
          variantCls,
          className
        )}
      >
        {pulse && !prefersReduced && (
          <span aria-hidden className="absolute inset-0 rounded-xl">
            <span className="absolute inset-0 animate-ping rounded-[inherit] bg-brand-500/20" />
          </span>
        )}
        <span className="relative z-10 flex items-center justify-center">{children}</span>
      </motion.button>
    );
  }
);
IconButton.displayName = "IconButton";
