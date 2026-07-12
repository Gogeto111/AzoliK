import * as React from "react";
import { motion } from "framer-motion";
import { Bell, Plus, HelpCircle, Inbox, Command, Sparkles, Zap } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAI } from "@/lib/aiStore";
import { useAuth } from "@/contexts/AuthContext";
import { useEngine } from "@/lib/engine";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Topbar() {
  const ai = useAI();
  const { profile } = useAuth();
  const engine = useEngine();
  const userName = profile?.displayName?.split(" ")[0] || "there";
  const agentsWorking = engine.metrics.agentsWorking || 0;

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.08 }}
      className="relative z-20 flex h-[64px] items-center justify-between px-8"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 280, damping: 26 }}
          className="flex items-center gap-3"
        >
          <h1 className="text-[20px] font-semibold tracking-[-0.025em] text-gradient-brand">
            {getGreeting()}, {userName}
          </h1>
          <Badge tone="emerald" dot pulse className="h-[18px]">
            {agentsWorking} agents active
          </Badge>
          {ai.thinking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[10.5px] font-medium text-brand-200 ring-1 ring-inset ring-brand-400/25"
            >
              <SparkleDot />
              Azolik thinking
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5">
        <motion.button
          onClick={() => ai.dispatch({ type: "TOGGLE_COMMAND" })}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 26 }}
          className="group mr-2 hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[12.5px] text-ink-300 backdrop-blur transition-all hover:border-brand-400/20 hover:bg-white/[0.04] hover:text-white md:flex"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          <span className="text-ink-400 group-hover:text-ink-200">Ask Azolik or jump to…</span>
          <span className="ml-4 flex items-center gap-0.5 text-[10px] text-ink-500">
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
              <Command className="inline h-3 w-3 -translate-y-px" />
            </kbd>
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">K</kbd>
          </span>
        </motion.button>

        <IconButton
          size="md"
          title="AI Copilot (⌘J)"
          pulse={ai.thinking}
          onClick={() => ai.dispatch({ type: "TOGGLE_COPILOT" })}
        >
          <Sparkles className="h-[17px] w-[17px] text-brand-300" strokeWidth={2} />
        </IconButton>
        <IconButton size="md" title="Command bar (⌘K)" onClick={() => ai.dispatch({ type: "TOGGLE_COMMAND" })}>
          <Zap className="h-[17px] w-[17px] text-amber-300" strokeWidth={2} />
        </IconButton>
        <IconButton size="md" title="Inbox">
          <div className="relative">
            <Inbox className="h-[17px] w-[17px]" strokeWidth={1.9} />
            <span className="absolute -right-1 -top-1 flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-brand-400 shadow-[0_0_6px_rgba(95,131,255,0.9)]" />
            </span>
          </div>
        </IconButton>
        <IconButton size="md" title="Notifications">
          <div className="relative">
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[8px] w-[8px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            </span>
          </div>
        </IconButton>
        <IconButton size="md" title="Help">
          <HelpCircle className="h-[17px] w-[17px]" strokeWidth={1.9} />
        </IconButton>

        <div className="mx-1 h-5 w-px bg-white/10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.42, type: "spring", stiffness: 300, damping: 22 }}
        >
          <Button
            size="sm"
            variant="primary"
            className="gap-1.5"
            onClick={() => ai.dispatch({ type: "TOGGLE_COMMAND" })}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            New Agent
          </Button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          className="ml-1"
          onClick={() => ai.dispatch({ type: "TOGGLE_COPILOT" })}
        >
          <Avatar name={profile?.displayName || "User"} tone="brand" size="md" status="online" />
        </motion.button>
      </div>
    </motion.header>
  );
}

function SparkleDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_6px_rgba(143,174,255,0.9)]" />
    </span>
  );
}
