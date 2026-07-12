import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Inbox() {
  const { business } = useAuth();

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Support Inbox"
          description="Customer conversations handled by your AI Support team."
        />
        <GlassCard className="py-16 text-center" tilt={false}>
          <MessageSquare className="h-12 w-12 text-ink-500 mx-auto mb-3" />
          <h3 className="text-[16px] font-medium text-white">No business found</h3>
          <p className="mt-1 text-ink-400">Complete onboarding to start receiving customer conversations.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Support Inbox"
        description="Customer conversations handled by your AI Support team. Review, edit, and approve replies — you stay in control."
        badge={{ label: "0 need reply", tone: "muted", dot: true }}
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <GlassCard className="flex flex-col overflow-hidden" tilt={false}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-white">Conversations</h3>
            <Badge tone="muted">0 active</Badge>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 text-center text-ink-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-ink-500" />
              <p className="text-[13px]">No conversations yet</p>
              <p className="text-[11px] mt-1">Your AI Support team will handle incoming messages automatically.</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col overflow-hidden" tilt={false}>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageSquare className="h-14 w-14 mx-auto mb-4 text-ink-500" />
              <h3 className="text-[17px] font-semibold text-white mb-1">No conversations</h3>
              <p className="text-ink-400">Customer messages will appear here once your AI team starts working.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
