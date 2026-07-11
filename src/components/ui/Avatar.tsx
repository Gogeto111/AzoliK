import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose" | "ink";
  status?: "online" | "idle" | "busy" | "offline";
  showInitials?: boolean;
};

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-9 w-9 text-[12.5px]",
  lg: "h-11 w-11 text-[13.5px]",
  xl: "h-14 w-14 text-[16px]",
};

const toneMap = {
  brand: "from-[#708dff] to-[#1d2acc]",
  violet: "from-[#a78bfa] to-[#6d28d9]",
  cyan: "from-[#22d3ee] to-[#0e7490]",
  emerald: "from-[#34d399] to-[#047857]",
  amber: "from-[#fbbf24] to-[#b45309]",
  rose: "from-[#fb7185] to-[#be123c]",
  ink: "from-[#454b5f] to-[#11131b]",
};

const statusColor = {
  online: "bg-emerald-400",
  idle: "bg-amber-400",
  busy: "bg-rose-400",
  offline: "bg-ink-500",
};

const statusSize = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-3.5 w-3.5",
};

function initials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  tone = "brand",
  status,
  className,
  ...rest
}: AvatarProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 16 } }}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        "bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
        sizeMap[size],
        toneMap[tone],
        "ring-1 ring-white/[0.08] ring-offset-0",
        className
      )}
      {...(rest as any)}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? "avatar"}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="drop-shadow-sm">{initials(name)}</span>
      )}
      {status && (
        <span
          className={cn(
            "absolute rounded-full ring-[2.5px] ring-[#0b0d15]",
            statusSize[size],
            statusColor[status],
            status === "online" && "shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          )}
          style={
            size === "md" || size === "lg" || size === "xl"
              ? { right: -1, bottom: -1 }
              : { right: 0, bottom: 0 }
          }
        >
          {status === "online" && !prefersReduced && (
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-70"
              style={{ background: "inherit" }}
            />
          )}
        </span>
      )}
    </motion.div>
  );
}
