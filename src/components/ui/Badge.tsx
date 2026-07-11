import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "default"
  | "brand"
  | "violet"
  | "emerald"
  | "cyan"
  | "amber"
  | "rose"
  | "muted";

const toneMap: Record<BadgeTone, string> = {
  default: "bg-white/[0.06] text-ink-100 border-white/10",
  muted:   "bg-white/[0.04] text-ink-300 border-white/[0.07]",
  brand:   "bg-brand-500/12 text-brand-200 border-brand-400/25",
  violet:  "bg-violet-500/12 text-violet-200 border-violet-400/22",
  emerald: "bg-emerald-500/12 text-emerald-200 border-emerald-400/22",
  cyan:    "bg-cyan-500/12 text-cyan-200 border-cyan-400/22",
  amber:   "bg-amber-500/12 text-amber-200 border-amber-400/22",
  rose:    "bg-rose-500/12 text-rose-200 border-rose-400/22",
};

const dotMap: Record<BadgeTone, string> = {
  default: "bg-ink-200",
  muted: "bg-ink-400",
  brand: "bg-brand-300 shadow-[0_0_8px_rgba(143,174,255,0.9)]",
  violet: "bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.8)]",
  emerald: "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]",
  cyan: "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]",
  amber: "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]",
  rose: "bg-rose-300 shadow-[0_0_8px_rgba(253,164,175,0.8)]",
};

function dotColor(tone: BadgeTone) {
  switch (tone) {
    case "default": return "rgb(238,240,244)";
    case "muted": return "rgb(138,145,166)";
    case "brand": return "rgb(143,174,255)";
    case "violet": return "rgb(196,181,253)";
    case "emerald": return "rgb(110,231,183)";
    case "cyan": return "rgb(103,232,249)";
    case "amber": return "rgb(252,211,77)";
    case "rose": return "rgb(253,164,175)";
  }
}
function dotBg(tone: BadgeTone) { return dotMap[tone].split(" ")[0]; }
function dotShadow(tone: BadgeTone) {
  const parts = dotMap[tone].split(" ").slice(1).join(" ");
  return parts || "";
}

export function Badge({
  tone = "default",
  className,
  children,
  dot,
  pulse,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.01em]",
        "backdrop-blur-sm",
        toneMap[tone],
        className
      )}
    >
      {dot && (
        <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: dotColor(tone) }}
            />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotBg(tone), dotShadow(tone))} />
        </span>
      )}
      {children}
    </span>
  );
}
