import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useEngine } from "@/lib/engine";
import { softSpring, snappySpring } from "@/lib/motion";
import {
  MessageSquare, Loader2, Check, Bot, ArrowRight, Send, Smartphone,
} from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: snappySpring },
};

export default function Inbox() {
  const engine = useEngine();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const id = window.setInterval(forceUpdate, 2000);
    return () => window.clearInterval(id);
  }, []);

  const latestMessages = engine.inbox.slice(0, 8);
  const latestTasks = engine.activeTasks.slice(0, 5);

  return (
    <motion.div
      className="space-y-6 pb-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariant} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">Inbox</h1>
          <p className="mt-1 text-[13px] text-ink-400">
            Customer conversations — handled end-to-end by your AI team.
          </p>
        </div>
        <Badge tone="emerald" dot pulse>
          {latestMessages.length} conversations
        </Badge>
      </motion.div>

      {/* Conversation Flow */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Incoming Messages */}
        <motion.div variants={itemVariant} className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-brand-300" />
            Incoming Messages
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {latestMessages.length === 0 ? (
                <GlassCard className="py-12 text-center" tilt={false}>
                  <Bot className="h-10 w-10 text-ink-500 mx-auto mb-3" />
                  <p className="text-[13px] text-ink-400">Waiting for customer messages...</p>
                  <p className="text-[11px] text-ink-500 mt-1">They'll stream in automatically</p>
                </GlassCard>
              ) : (
                latestMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ ...softSpring, delay: i * 0.05 }}
                  >
                    <CustomerMessage msg={msg} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* AI Processing Pipeline */}
        <motion.div variants={itemVariant} className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-300" />
            AI Processing Pipeline
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {latestTasks.length === 0 ? (
                <GlassCard className="py-12 text-center" tilt={false}>
                  <ArrowRight className="h-10 w-10 text-ink-500 mx-auto mb-3" />
                  <p className="text-[13px] text-ink-400">No active processing</p>
                  <p className="text-[11px] text-ink-500 mt-1">Tasks will appear when customers message</p>
                </GlassCard>
              ) : (
                latestTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ ...softSpring, delay: i * 0.05 }}
                  >
                    <ProcessingTask task={task} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function CustomerMessage({ msg }: { msg: any }) {
  const channelColors: Record<string, string> = {
    whatsapp: "bg-emerald-600",
    email: "bg-blue-600",
    instagram: "bg-pink-600",
    sms: "bg-gray-600",
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${channelColors[msg.customer.channel] || "bg-gray-600"}`}>
          <span className="text-[11px] font-bold text-white">{msg.customer.name.charAt(0)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-white">{msg.customer.name}</span>
            <Badge tone="muted" size="xs">{msg.customer.channel}</Badge>
          </div>
        </div>
        <span className="text-[10px] text-ink-500">
          {Math.floor((Date.now() - msg.receivedAt) / 1000)}s ago
        </span>
      </div>
      <div className="ml-9 rounded-lg bg-emerald-800/50 px-3 py-2">
        <p className="text-[12px] text-white/90">{msg.text}</p>
      </div>
    </div>
  );
}

function ProcessingTask({ task }: { task: any }) {
  const isRunning = task.status === "running";
  const isHandoff = task.status === "waiting_handoff";
  const isCompleted = task.status === "completed";

  const steps = [
    { label: "Support thinks", active: isRunning && task.progress < 30, done: task.progress >= 30 },
    { label: "Inventory checked", active: isRunning && task.progress >= 30 && task.progress < 50, done: task.progress >= 50 },
    { label: "Finance creates payment", active: isRunning && task.progress >= 50 && task.progress < 70, done: task.progress >= 70 },
    { label: "Reply sent", active: isRunning && task.progress >= 70, done: isCompleted },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[12px] text-white font-medium truncate">{task.title}</p>
        <Badge
          tone={isCompleted ? "emerald" : isRunning ? "cyan" : isHandoff ? "amber" : "muted"}
          size="xs"
          dot
          pulse={isRunning}
        >
          {isCompleted ? "Done" : isRunning ? "Processing" : isHandoff ? "Handoff" : "Queued"}
        </Badge>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: step.done || step.active ? 1 : 0.4 }}
            className="flex items-center gap-2"
          >
            {step.done ? (
              <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
            ) : step.active ? (
              <Loader2 className="h-3 w-3 text-brand-400 animate-spin" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-ink-600" />
            )}
            <span className={`text-[11px] ${step.active ? "text-white font-medium" : step.done ? "text-ink-300" : "text-ink-500"}`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>

      {isRunning && (
        <div className="mt-3 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
