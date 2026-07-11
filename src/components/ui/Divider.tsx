import * as React from "react";
import { cn } from "@/lib/utils";

export function Divider({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <span
        className={cn("inline-block h-5 w-px bg-white/10", className)}
        aria-hidden
      />
    );
  }
  return (
    <span
      className={cn("block h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent", className)}
      aria-hidden
    />
  );
}
