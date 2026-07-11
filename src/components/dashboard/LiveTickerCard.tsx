import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiveActivityTicker } from "@/components/os/LiveActivityTicker";
import { Sparkles } from "lucide-react";

export function LiveTickerCard() {
  return (
    <GlassCard className="p-5" tilt={false}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-brand-200 ring-1 ring-inset ring-white/10">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-white">AI Activity Stream</h3>
          <p className="text-[11.5px] text-ink-400">Every agent, every task — live</p>
        </div>
      </div>
      <LiveActivityTicker compact />
    </GlassCard>
  );
}
