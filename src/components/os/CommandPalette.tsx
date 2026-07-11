import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAI } from "@/lib/aiStore";
import {
  LayoutDashboard,
  Building2,
  Workflow,
  Blocks,
  BarChart3,
  Store,
  Settings as SettingsIcon,
  Search,
  Plus,
  Zap,
  Sparkles,
  ArrowRight,
  Mic,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Cake,
  Calendar as CalendarIcon,
  Dumbbell,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "@/data/departments";
import { workforceEngine, executeRequest, switchIndustry, INDUSTRIES_META } from "@/lib/engine";

type ActionCtx = {
  navigate: (p: string) => void;
  ai: ReturnType<typeof useAI>;
  close: () => void;
  q?: string;
};

type Command = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  category: string;
  tone?: "brand" | "emerald" | "violet" | "cyan" | "amber" | "rose";
  action: (ctx: ActionCtx) => void;
  keywords?: string[];
};

const COMMANDS: Command[] = [
  { id: "nav-dashboard", title: "Go to Dashboard", subtitle: "Overview & AI activity", icon: LayoutDashboard, category: "Navigation", tone: "brand", keywords: ["home", "overview"] , action: ({ navigate, close }) => { navigate("/"); close(); } },
  { id: "nav-departments", title: "Open Departments", subtitle: "Manage all 6 AI teams", icon: Building2, category: "Navigation", tone: "violet", keywords: ["teams", "agents"], action: ({ navigate, close }) => { navigate("/departments"); close(); } },
  { id: "nav-automation", title: "Open Workflows", subtitle: "Live workflow canvas", icon: Workflow, category: "Navigation", tone: "cyan", keywords: ["workflows", "automations"], action: ({ navigate, close }) => { navigate("/automation"); close(); } },
  { id: "nav-integrations", title: "Open Integrations", subtitle: "Connect tools", icon: Blocks, category: "Navigation", tone: "emerald", keywords: ["apps"], action: ({ navigate, close }) => { navigate("/integrations"); close(); } },
  { id: "nav-analytics", title: "Open Analytics", subtitle: "Reports & ROI", icon: BarChart3, category: "Navigation", tone: "amber", keywords: ["reports", "stats"], action: ({ navigate, close }) => { navigate("/analytics"); close(); } },
  { id: "nav-marketplace", title: "Browse Marketplace", subtitle: "Install AI departments", icon: Store, category: "Navigation", tone: "rose", action: ({ navigate, close }) => { navigate("/marketplace"); close(); } },
  { id: "nav-settings", title: "Open Settings", subtitle: "Workspace preferences", icon: SettingsIcon, category: "Navigation", action: ({ navigate, close }) => { navigate("/settings"); close(); } },

  // Work-assignment commands (this is the REAL work of the product)
  { id: "assign-customer", title: "Assign a customer message", subtitle: "Support handles it end-to-end", icon: MessageSquare, category: "Assign work", tone: "cyan", keywords: ["msg", "inbox", "message", "customer"], action: ({ close, ai, q }) => {
    const text = (q ?? "").replace(/^assign\s*/i, "").trim() || "Hi, do you have chocolate cake?";
    executeRequest(text);
    ai.dispatch({ type: "AI_RESPONSE", content: `On it. Your **Support** team just picked that up. Watch the Inbox — you'll get a notification when it's done.` });
    close();
  } },
  { id: "run-bakery-flow", title: "Simulate: Cake inquiry", subtitle: '"Do you have chocolate cake?"', icon: Cake, category: "Assign work", tone: "amber", action: ({ close }) => { workforceEngine.runOrderFlow(); close(); } },
  { id: "run-appointment-flow", title: "Simulate: Book appointment", subtitle: '"Doctor free tomorrow?"', icon: CalendarIcon, category: "Assign work", tone: "violet", action: ({ close }) => { workforceEngine.runAppointmentFlow(); close(); } },
  { id: "run-lead-flow", title: "Simulate: Fees inquiry", subtitle: '"Fees kitni hai?"', icon: Dumbbell, category: "Assign work", tone: "emerald", action: ({ close }) => { workforceEngine.runLeadFlow(); close(); } },

  // Industry switch
  ...(Object.keys(INDUSTRIES_META) as Array<keyof typeof INDUSTRIES_META>).map((k) => {
    const m = INDUSTRIES_META[k];
    return {
      id: `switch-${k}`,
      title: `Switch to ${m.name}`,
      subtitle: m.tagline,
      icon: Building2,
      category: "Business",
      tone: "brand" as const,
      keywords: [m.name.toLowerCase(), "industry", "template", "pack"],
      action: ({ navigate, close }) => { switchIndustry(k); navigate("/"); close(); },
    } as Command;
  }),

  { id: "pause-all", title: "Pause all departments", subtitle: "Quiet mode", icon: PauseCircle, category: "Business", tone: "rose", action: ({ close }) => { workforceEngine.stop(); close(); } },
  { id: "resume-all", title: "Resume workforce", subtitle: "Back on shift", icon: PlayCircle, category: "Business", tone: "emerald", action: ({ close }) => { workforceEngine.start(); close(); } },

  // Department deeplinks
  ...DEPARTMENTS.map((d): Command => ({
    id: `dept-${d.id}`,
    title: `Open ${d.name} department`,
    subtitle: d.tagline,
    icon: d.icon,
    category: "Departments",
    tone: ((d.id === "support" ? "cyan" : d.id === "sales" ? "emerald" : d.id === "marketing" ? "violet" : d.id === "operations" ? "amber" : d.id === "finance" ? "rose" : "brand") as Command["tone"]),
    keywords: [d.name.toLowerCase()],
    action: ({ navigate, close }: ActionCtx) => { navigate(`/departments/${d.id}`); close(); },
  })),
];

const toneBg = {
  brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
  violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
  cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
  emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
  amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
  rose: "from-rose-500/30 to-rose-700/10 text-rose-200",
};

export function CommandPalette() {
  const ai = useAI();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const isAI = q.startsWith(">") || q.startsWith("ask") || q.startsWith("?") || q.trim().endsWith("?");

  const filtered = React.useMemo(() => {
    const lower = q.toLowerCase().replace(/^[>?]/, "").trim();
    if (!lower) return COMMANDS;
    return COMMANDS.filter((c) => {
      const hay = [c.title, c.subtitle ?? "", c.category, ...(c.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(lower);
    });
  }, [q]);

  React.useEffect(() => {
    if (ai.commandOpen) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [ai.commandOpen]);

  React.useEffect(() => { setActive(0); }, [q]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const close = () => ai.dispatch({ type: "CLOSE_COMMAND" });

  const runAI = () => {
    const text = q.replace(/^[>?]/i, "").trim() || "What can you help me with?";
    ai.dispatch({ type: "OPEN_COPILOT" });
    ai.dispatch({ type: "SEND_MESSAGE", content: text });
    close();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - (isAI ? 0 : 1), a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (isAI) return runAI();
      const cmd = filtered[active];
      if (cmd) cmd.action({ navigate, ai, close, q });
    }
  };

  return (
    <AnimatePresence>
      {ai.commandOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.9 }}
            className="relative z-10 w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(14,16,24,0.85)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
            style={{ backdropFilter: "blur(32px) saturate(180%)" }}
          >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <Search className="h-4 w-4 text-ink-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask Azolik anything, or type a command…"
                className="flex-1 bg-transparent text-[15px] text-white placeholder:text-ink-500 focus:outline-none"
                autoFocus
              />
              <button
                title="Voice command"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-ink-300 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <Mic className="h-3.5 w-3.5" />
              </button>
              <kbd className="hidden items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-ink-400 sm:flex">esc</kbd>
            </div>

            {isAI && (
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-brand-500/[0.06] px-4 py-2 text-[12px] text-brand-200">
                <Sparkles className="h-3.5 w-3.5" />
                Ask Azolik — press Enter to send
                <CornerDownLeft className="ml-auto h-3 w-3" />
              </div>
            )}

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
              {filtered.length === 0 && !isAI && (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-white/10">
                    <Sparkles className="h-5 w-5 text-brand-200" />
                  </div>
                  <p className="mt-3 text-[13px] text-ink-300">No matches found</p>
                  <p className="mt-1 text-[11px] text-ink-500">Ask Azolik directly by ending with ? or starting with {">"}</p>
                </div>
              )}

              {groupByCategory(filtered).map(([cat, items]) => (
                <div key={cat} className="mb-1">
                  <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">{cat}</div>
                  {items.map((c) => {
                    const idx = filtered.indexOf(c);
                    const isActive = idx === active;
                    const Icon = c.icon;
                    return (
                      <motion.button
                        key={c.id}
                        data-idx={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => c.action({ navigate, ai, close, q })}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.015, type: "spring", stiffness: 320, damping: 26 }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                        )}
                      >
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/[0.08]", toneBg[c.tone ?? "brand"])}>
                          <Icon className="h-[15px] w-[15px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-medium text-white">{c.title}</span>
                          </div>
                          {c.subtitle && <div className="truncate text-[11.5px] text-ink-400">{c.subtitle}</div>}
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-1 text-[10.5px] text-ink-400">
                            <span>Enter</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/20 px-4 py-2 text-[10.5px] text-ink-500">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1"><ArrowUp className="h-2.5 w-2.5" /><ArrowDown className="h-2.5 w-2.5" /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="h-2.5 w-2.5" /> select</span>
                <span>esc close</span>
              </div>
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-brand-300" /> Azolik AI</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function groupByCategory<T extends { category: string }>(items: T[]): [string, T[]][] {
  const m = new Map<string, T[]>();
  for (const it of items) {
    if (!m.has(it.category)) m.set(it.category, []);
    m.get(it.category)!.push(it);
  }
  return Array.from(m.entries());
}
