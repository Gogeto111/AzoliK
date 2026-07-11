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

type Variant = "primary" | "secondary" | "ghost" | "glass";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

const base =
  "relative inline-flex items-center justify-center gap-2 font-medium select-none transition-colors duration-200 focus-visible:ring-focus disabled:opacity-50 disabled:pointer-events-none";

const sizeMap: Record<Size, string> = {
  xs: "h-6 px-2 text-[11px] rounded-lg gap-1",
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-9.5 px-4 text-[13.5px] rounded-xl gap-2",
  lg: "h-12 px-5.5 text-[14.5px] rounded-2xl gap-2",
  icon: "h-9 w-9 rounded-xl",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-[#708dff] to-[#2538ef] text-white",
  secondary:
    "bg-white/[0.04] text-ink-100 border border-white/[0.08] hover:bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  ghost:
    "text-ink-300 hover:bg-white/[0.04] hover:text-white",
  glass:
    "glass text-ink-100 hover:text-white hover:bg-white/[0.03]",
};

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", magnetic = true, children, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    const inner = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => inner.current!);

    // Magnetic pull
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const smx = useSpring(mx, { stiffness: 320, damping: 22, mass: 0.5 });
    const smy = useSpring(my, { stiffness: 320, damping: 22, mass: 0.5 });

    // Glow pointer (primary)
    const gx = useMotionValue(50);
    const gy = useMotionValue(50);
    const sgx = useSpring(gx, { stiffness: 220, damping: 24 });
    const sgy = useSpring(gy, { stiffness: 220, damping: 24 });
    const glowBg = useMotionTemplate`radial-gradient(160px circle at ${sgx}% ${sgy}%, rgba(255,255,255,0.28), transparent 45%)`;

    const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (prefersReduced || !magnetic) return;
      const el = inner.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      mx.set((px - 0.5) * 4);
      my.set((py - 0.5) * 4);
      if (variant === "primary") {
        gx.set(px * 100);
        gy.set(py * 100);
      }
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
      gx.set(50);
      gy.set(50);
    };

    return (
      <motion.button
        ref={inner}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={prefersReduced ? { scale: 0.98 } : { scale: 0.95, transition: { type: "spring", stiffness: 500, damping: 18, mass: 0.6 } }}
        style={{ x: smx, y: smy }}
        className={cn(
          base,
          sizeMap[size],
          variantMap[variant],
          variant === "primary" && "shadow-[0_8px_22px_-6px_rgba(59,91,255,0.55),inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_12px_30px_-8px_rgba(59,91,255,0.7),inset_0_1px_0_rgba(255,255,255,0.35)]",
          "isolation: isolate;",
          className
        )}
        {...props}
      >
        {variant === "primary" && !prefersReduced && (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-90"
              style={{ background: glowBg as unknown as string }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
              initial={false}
            >
              <motion.span
                aria-hidden
                className="absolute inset-y-0 w-1/3"
                initial={{ x: "-100%", opacity: 0 }}
                whileHover={{ x: "320%", opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)" }}
              />
            </motion.span>
            {/* Ambient glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1 -z-20 rounded-[inherit] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(closest-side, rgba(95,131,255,0.55), transparent 70%)" }}
            />
          </>
        )}
        {variant === "secondary" && !prefersReduced && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 hover:opacity-100"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
          />
        )}
        {variant !== "ghost" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-2 top-px h-px rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-[inherit] leading-none">
          {children as React.ReactNode}
        </span>
      </motion.button>
    );
  }
);
Button.displayName = "Button";
