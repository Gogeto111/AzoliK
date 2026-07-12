import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAI, type Message, type ReasoningStep } from "@/lib/aiStore";
import { Sparkles, X, Send, Mic, Zap, Brain, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { useAuth } from "@/contexts/AuthContext";

export function AICopilot() {
  const ai = useAI();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { profile } = useAuth();
  const userName = profile?.displayName || "User";

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [ai.conversation.length, ai.thinking]);

  React.useEffect(() => {
    if (ai.copilotOpen) setTimeout(() => textareaRef.current?.focus(), 280);
  }, [ai.copilotOpen]);

  const send = () => {
    const v = input.trim();
    if (!v) return;
    ai.dispatch({ type: "SEND_MESSAGE", content: v });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const suggestions = [
    "What needs my attention?",
    "Activate Marketing department",
    "Give me a revenue update",
    "How is Support performing?",
  ];

  return (
    <AnimatePresence>
      {ai.copilotOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => ai.dispatch({ type: "CLOSE_COPILOT" })}
            className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[2px] lg:hidden"
          />
          <motion.aside
            initial={{ x: 440, opacity: 0, filter: "blur(12px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: 440, opacity: 0, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 30, mass: 1 }}
            className="fixed right-3 top-3 bottom-3 z-[50] flex w-[420px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl glass-strong shadow-float"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#708dff] via-brand-500 to-brand-700 shadow-[0_8px_22px_-6px_rgba(59,91,255,0.6),inset_0_1px_0_rgba(255,255,255,0.28)]">
                  <Sparkles className="h-[17px] w-[17px] text-white" strokeWidth={2.2} />
                  {ai.thinking && (
                    <span className="pointer-events-none absolute -inset-1 rounded-xl">
                      <span className="absolute inset-0 animate-ping rounded-xl bg-brand-500/30" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-white">Azolik</span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-px text-[9.5px] font-medium text-emerald-200 ring-1 ring-inset ring-emerald-400/20">
                      <span className="relative flex h-1 w-1">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-400" />
                      </span>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                    <Brain className="h-3 w-3" />
                    Connected to 6 departments · 44 agents
                  </div>
                </div>
              </div>
              <IconButton variant="ghost" size="sm" title="Close" onClick={() => ai.dispatch({ type: "CLOSE_COPILOT" })}>
                <X className="h-[15px] w-[15px]" />
              </IconButton>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {ai.conversation.map((m) => (
                <MessageBubble key={m.id} message={m} userName={userName} />
              ))}
              <AnimatePresence>
                {ai.thinking && <ThinkingIndicator key="thinking" text={ai.thinkingText} />}
              </AnimatePresence>

              {ai.conversation.length <= 1 && !ai.thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 26 }}
                  className="mt-2"
                >
                  <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">Try asking</div>
                  <div className="grid gap-1.5">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 300, damping: 24 }}
                        onClick={() => { ai.dispatch({ type: "SEND_MESSAGE", content: s }); }}
                        className="group flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-[12.5px] text-ink-200 transition-all hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-brand-300" />
                          {s}
                        </span>
                        <ChevronRight className="h-3 w-3 text-ink-500 transition-transform group-hover:translate-x-0.5" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="group flex items-end gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-2 transition-colors focus-within:border-brand-400/30 focus-within:bg-black/30 focus-within:ring-2 focus-within:ring-brand-500/20">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Ask Azolik to do anything…"
                  className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] leading-snug text-white placeholder:text-ink-500 focus:outline-none"
                  style={{ maxHeight: 140 }}
                />
                <button
                  title="Voice"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className={cn(
                    "flex h-8 items-center gap-1 rounded-lg px-3 text-[12px] font-medium transition-all",
                    input.trim()
                      ? "bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_6px_16px_-4px_rgba(59,91,255,0.6)]"
                      : "bg-white/5 text-ink-500"
                  )}
                >
                  <Send className="h-3 w-3" />
                  Send
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-ink-500">
                <span className="flex items-center gap-2">
                  <span>⌘J to toggle</span>
                  <span>·</span>
                  <span>Enter to send</span>
                  <span>·</span>
                  <span>Shift+↵ newline</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Context-aware
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MessageBubble({ message, userName }: { message: Message; userName: string }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <Avatar name={userName} tone="brand" size="sm" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 ring-1 ring-inset ring-white/10">
          <Sparkles className="h-[15px] w-[15px] text-white" strokeWidth={2.2} />
        </div>
      )}
      <div className={cn("max-w-[78%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-xl px-3.5 py-2.5 text-[13px] leading-[1.55]",
            isUser
              ? "bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(59,91,255,0.5)]"
              : "border border-white/[0.06] bg-white/[0.03] text-ink-100"
          )}
        >
          <FormattedText text={message.content} />
        </div>
        {message.steps && <ReasoningChain steps={message.steps} />}
      </div>
    </motion.div>
  );
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i} className="whitespace-pre-wrap">{p}</span>
        )
      )}
    </span>
  );
}

function ReasoningChain({ steps }: { steps: ReasoningStep[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 26 }}
      className="space-y-1 rounded-lg border border-white/[0.06] bg-black/20 p-2.5"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
        <Brain className="h-2.5 w-2.5" /> Reasoning
      </div>
      {steps.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * i }}
          className="flex items-center gap-2 text-[11.5px]"
        >
          {s.status === "done" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          {s.status === "thinking" && <Loader2 className="h-3 w-3 animate-spin text-brand-300" />}
          {s.status === "pending" && <span className="ml-0.5 h-2 w-2 rounded-full border border-ink-600" />}
          <span className={cn(s.status === "pending" ? "text-ink-500" : "text-ink-200")}>{s.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ThinkingIndicator({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 ring-1 ring-inset ring-white/10">
        <Sparkles className="h-[15px] w-[15px] text-white" strokeWidth={2.2} />
      </div>
      <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-[11px] text-brand-200">
          <Brain className="h-3 w-3" />
          <span className="font-medium uppercase tracking-[0.08em]">thinking</span>
          <span className="inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-1 w-1 rounded-full bg-brand-300"
                animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </span>
        </div>
        <div className="mt-1 text-[12.5px] italic text-ink-300">{text}</div>
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
