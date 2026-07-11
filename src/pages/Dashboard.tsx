import * as React from "react";
import { FadeIn } from "@/components/ui/Stagger";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { OwnerKPIs } from "@/components/dashboard/OwnerKPIs";
import { WorkforceView } from "@/components/dashboard/WorkforceView";
import { InboxFeed } from "@/components/dashboard/InboxFeed";
import { TaskExecutions } from "@/components/dashboard/TaskExecutions";
import { ToolCallsFeed } from "@/components/dashboard/ToolCallsFeed";
import { BusinessMemory } from "@/components/dashboard/BusinessMemory";
import { OwnerNotifications } from "@/components/dashboard/OwnerNotifications";
import { AttentionFeed } from "@/components/dashboard/AttentionFeed";
import { CollaborationView } from "@/components/dashboard/CollaborationView";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-4">
      <WelcomeHero />

      <FadeIn delay={0.2}>
        <OwnerKPIs />
      </FadeIn>

      <FadeIn delay={0.22}>
        <WorkforceView />
      </FadeIn>

      {/* Attention first */}
      <FadeIn delay={0.24}>
        <AttentionFeed />
      </FadeIn>

      {/* Real work: inbox + execution + notifications */}
      <FadeIn delay={0.25}>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-6">
            <InboxFeed />
            <TaskExecutions />
          </div>
          <div className="grid gap-6">
            <OwnerNotifications />
            <ToolCallsFeed />
          </div>
        </div>
      </FadeIn>

      {/* Chart + Collaboration */}
      <FadeIn delay={0.3}>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <ActivityChart />
          <CollaborationView />
        </div>
      </FadeIn>

      {/* Business memory */}
      <FadeIn delay={0.32}>
        <BusinessMemory />
      </FadeIn>

      <FadeIn delay={0.35}>
        <GlassCard tone="subtle" className="flex flex-col gap-2 px-6 py-4 text-[12px] text-ink-400 sm:flex-row sm:items-center sm:justify-between" tilt={false}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </span>
            All departments online · tools executing in real time · no hallucinations
          </div>
          <div className="flex items-center gap-3 text-[11px] tabular-nums text-ink-500">
            <span className="italic">"Most AIs work with you. Azolik works for you."</span>
            <span>Azolik · Workforce OS</span>
          </div>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
