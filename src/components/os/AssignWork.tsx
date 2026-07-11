import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Send, X, MessageSquare, Cake, Calendar as CalendarIcon, Dumbbell, ArrowRight } from "lucide-react";
import { executeRequest, workforceEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";

const PRESETS = [
  { icon: Cake, label: '"Do you have chocolate cake?"', tone: "amber" as const, run: () => workforceEngine.runOrderFlow() },
  { icon: CalendarIcon, label: '"Doctor free tomorrow?"', tone: "violet" as const, run: () => workforceEngine.runAppointmentFlow() },
  { icon: Dumbbell, label: '"Fees kitni hai?"', tone: "emerald" as const, run: () => workforceEngine.runLeadFlow() },
];

const TONES: Record<string, string> = {
  amber: "from-amber-500/30 to-amber-700/10 text-amber-200 ring-amber-400/20",
  violet: "from-violet-500/30 to-violet-700/10 text-violet-200 ring-violet-400/20",
  emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200 ring-emerald-400/20",
  brand: "from-brand-500/30 to-brand-700/10 text-brand-200 ring-brand-400/20",
};

export function AssignWork() {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [justSent, setJustSent] = React.useState<string | null>(null);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    executeRequest(v);
    setJustSent(v);
    setText("");
    setTimeout(() => setJustSent(null), 4000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              key="composer"
              initial={{ opacity: 0, y: 12, scale: 0.95, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 12, scale: 0.95, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-[380px] max-w-[calc(100vw-3rem)]"
            >
              <GlassCard className="p-4 shadow-float" tilt={false}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-brand-200 ring-1 ring-inset ring-brand-400/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-white">Assign work to your team</div>
                      <div className="text-[11px] text-ink-400">
                        Paste a customer message or describe a task — your departments will take it from there.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-ink-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-2 focus-within:border-brand-400/30 focus-within:ring-2 focus-within:ring-brand-500/20">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={3}
                    placeholder='e.g. "Hi, do you have chocolate cake right now?"'
                    className="w-full resize-none bg-transparent px-2 py-1.5 text-[13px] text-white placeholder:text-ink-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-[10px] text-ink-500">Enter to assign · Shift+↵ newline</span>
                    <Button size="sm" variant="primary" className="gap-1" onClick={send} disabled={!text.trim()}>
                      Assign
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                    Try a demo message
                  </div>
                  <div className="grid gap-1.5">
                    {PRESETS.map((p) => {
                      const Ico = p.icon;
                      return (
                        <button
                          key={p.label}
                          onClick={() => { p.run(); setOpen(false); }}
                          className="group flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-all hover:-translate-y-px hover:border-white/10 hover:bg-white/[0.04]"
                        >
                          <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-inset", TONES[p.tone])}>
                            <Ico className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 text-[12px] text-ink-200">{p.label}</span>
                          <ArrowRight className="h-3 w-3 text-ink-500 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {justSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[11.5px] text-emerald-200"
                    >
                      ✓ Assigned. Watch the Inbox and Live Execution panels for progress.
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((o) => !o)}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-4 py-3 text-[13px] font-medium text-white shadow-[0_12px_40px_-8px_rgba(59,91,255,0.8)]"
        >
          <MessageSquare className="h-4 w-4" />
          Assign work
          <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] tabular-nums">
            {workforceEngine.state.metrics.tasksRunning} running
          </span>
        </motion.button>
      </motion.div>
    </>
  );
}
