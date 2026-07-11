import * as React from "react";
import { workforceEngine } from "./engine";
import { DEPARTMENTS } from "@/data/departments";

export type LogLevel = "info" | "success" | "warning" | "error" | "reasoning" | "thinking" | "task";

export type ActivityItem = {
  id: string;
  at: number;
  dept: string;
  deptTone: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose";
  agent: string;
  message: string;
  level: LogLevel;
  progress?: number;
};

type AIState = {
  thinking: boolean;
  thinkingText: string;
  thinkingSteps: ReasoningStep[];
  activeDept: string | null;
  activatingDept: string | null;
  commandOpen: boolean;
  copilotOpen: boolean;
  conversation: Message[];
  activity: ActivityItem[];
  dispatch: (e: AIEvent) => void;
};

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  at: number;
  steps?: ReasoningStep[];
};

export type ReasoningStep = {
  label: string;
  status: "pending" | "thinking" | "done";
  detail?: string;
};

type AIEvent =
  | { type: "OPEN_COMMAND" }
  | { type: "CLOSE_COMMAND" }
  | { type: "TOGGLE_COMMAND" }
  | { type: "OPEN_COPILOT" }
  | { type: "CLOSE_COPILOT" }
  | { type: "TOGGLE_COPILOT" }
  | { type: "THINKING_START"; text: string; steps?: ReasoningStep[] }
  | { type: "THINKING_STOP" }
  | { type: "SEND_MESSAGE"; content: string }
  | { type: "AI_RESPONSE"; content: string; steps?: ReasoningStep[] }
  | { type: "ACTIVATE_DEPT"; dept: string }
  | { type: "DEPT_ACTIVATED" }
  | { type: "LOG"; item: Omit<ActivityItem, "id" | "at"> };

const MAX_ACTIVITY = 60;
const MAX_MESSAGES = 50;

function makeId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

const deptToneMap: Record<string, ActivityItem["deptTone"]> = {
  Support: "cyan",
  Sales: "emerald",
  Marketing: "violet",
  Operations: "amber",
  Finance: "rose",
  HR: "brand",
};

const initialState: Omit<AIState, "dispatch"> = {
  thinking: false,
  thinkingText: "",
  thinkingSteps: [],
  activeDept: null,
  activatingDept: null,
  commandOpen: false,
  copilotOpen: false,
  conversation: [
    {
      id: "seed",
      role: "ai",
      content: "Good morning, Alex. Your workforce is online across all 6 departments. 44 agents are processing **3,486 tasks** today and have generated **₹48,210** in revenue. What would you like me to coordinate?",
      at: Date.now(),
    },
  ],
  activity: [],
};

function reducer(state: AIState, event: AIEvent): Omit<AIState, "dispatch"> {
  switch (event.type) {
    case "OPEN_COMMAND": return { ...state, commandOpen: true };
    case "CLOSE_COMMAND": return { ...state, commandOpen: false };
    case "TOGGLE_COMMAND": return { ...state, commandOpen: !state.commandOpen };
    case "OPEN_COPILOT": return { ...state, copilotOpen: true };
    case "CLOSE_COPILOT": return { ...state, copilotOpen: false };
    case "TOGGLE_COPILOT": return { ...state, copilotOpen: !state.copilotOpen };
    case "THINKING_START":
      return { ...state, thinking: true, thinkingText: event.text, thinkingSteps: event.steps ?? [] };
    case "THINKING_STOP":
      return { ...state, thinking: false, thinkingText: "", thinkingSteps: [] };
    case "SEND_MESSAGE":
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { id: makeId(), role: "user" as const, content: event.content, at: Date.now() },
        ].slice(-MAX_MESSAGES),
      };
    case "AI_RESPONSE":
      return {
        ...state,
        thinking: false,
        thinkingText: "",
        thinkingSteps: [],
        conversation: [
          ...state.conversation,
          {
            id: makeId(),
            role: "ai" as const,
            content: event.content,
            at: Date.now(),
            steps: event.steps,
          },
        ].slice(-MAX_MESSAGES),
      };
    case "ACTIVATE_DEPT":
      return { ...state, activatingDept: event.dept };
    case "DEPT_ACTIVATED":
      return { ...state, activatingDept: null };
    case "LOG":
      return {
        ...state,
        activity: [
          { ...event.item, id: makeId(), at: Date.now() },
          ...state.activity,
        ].slice(0, MAX_ACTIVITY),
      };
    default:
      return state;
  }
}

const AIContext = React.createContext<AIState | null>(null);

// Seeded reasoning steps
function stepsForIntent(intent: string): ReasoningStep[] {
  if (intent.includes("activate"))
    return [
      { label: "Bootstrapping department agents", status: "done" },
      { label: "Connecting integrations", status: "thinking" },
      { label: "Warming workflows", status: "pending" },
      { label: "Reasoning online", status: "pending" },
    ];
  if (intent.includes("order") || intent.includes("buy") || intent.includes("stock"))
    return [
      { label: "Understanding request", status: "done" },
      { label: "Checking inventory", status: "thinking" },
      { label: "Coordinating with Sales", status: "pending" },
      { label: "Preparing invoice", status: "pending" },
      { label: "Sending confirmation", status: "pending" },
    ];
  return [
    { label: "Understanding request", status: "done" },
    { label: "Routing to relevant departments", status: "thinking" },
    { label: "Gathering context", status: "pending" },
    { label: "Composing response", status: "pending" },
  ];
}

function aiReplyFor(q: string): { reply: string; action?: () => void; steps?: ReasoningStep[] } {
  const lc = q.toLowerCase();
  // Activate department
  for (const d of DEPARTMENTS) {
    if (lc.includes(d.name.toLowerCase()) && (lc.includes("activate") || lc.includes("wake") || lc.includes("turn on"))) {
      return {
        reply: `Waking up **${d.name}** now. You'll see agents boot, tools connect, and workflows warm in real-time. Once online, ${d.agents.length} agents will begin processing work immediately.`,
        action: () => workforceEngine.addTimeline({
          type: "decision", department: d.id,
          title: `${d.name} initializing`, description: "Booting agents and connecting tools", status: "running",
        }),
        steps: stepsForIntent("activate"),
      };
    }
  }
  if (lc.includes("revenue") || lc.includes("sales") || lc.includes("pipeline")) {
    return {
      reply: `Today **₹${workforceEngine.state.metrics.revenueGenerated.toLocaleString("en-IN")}** has been generated (+12% vs yesterday). Pipeline coverage is healthy at 3.8x. Top 3 deals: **Atlas Corp** (₹73L, late-stage), **NorthPeak** (₹51L, contracting), and **Vimble** (₹36L, demo booked). I've nudged Sales to follow up with Vimble.`,
      steps: [
        { label: "Pulling pipeline from CRM", status: "done" },
        { label: "Calculating today's revenue", status: "done" },
        { label: "Prioritizing top deals", status: "done" },
        { label: "Queuing follow-up", status: "done" },
      ],
    };
  }
  if (lc.includes("order") || lc.includes("buy") || lc.includes("stock") || lc.includes("available")) {
    workforceEngine.runOrderFlow();
    return {
      reply: `On it. I've handed this to your **Support** team — they're checking availability now and will loop in Sales (payment link), Operations (reservation) and Finance (invoice) automatically. Watch the Inbox and Live Execution panels for every step.`,
      steps: stepsForIntent("order"),
    };
  }
  if (lc.includes("support") || lc.includes("ticket") || lc.includes("customer")) {
    return {
      reply: `Support has handled **${DEPARTMENTS[0].stats.tasksToday.toLocaleString()} tickets today** with a **98% CSAT** and **1.8s average response time**. There are 14 open items, one high-priority escalation is flagged in the activity feed. I've routed it to the Escalation Manager.`,
      steps: [
        { label: "Pulling Support metrics", status: "done" },
        { label: "Identifying escalations", status: "done" },
        { label: "Flagging priority ticket", status: "done" },
      ],
    };
  }
  if (lc.includes("attention") || lc.includes("priorit") || lc.includes("need me")) {
    return {
      reply: `Here's what needs you today:\n\n1. **Finance** flagged 2 invoices for review (one shows a GST mismatch)\n2. **Marketing** is waiting on your Q3 campaign approval\n3. **Support** has 1 high-priority escalation from a VIP customer\n4. **HR** shortlisted 5 candidates for Sr. Engineer — ready for your review\n\nShall I open the finance review first?`,
      steps: [
        { label: "Scanning all 6 departments", status: "done" },
        { label: "Prioritizing by urgency", status: "done" },
        { label: "Compiling action list", status: "done" },
      ],
    };
  }
  if (lc.includes("invoice") || lc.includes("expense") || lc.includes("bill")) {
    workforceEngine.handleUserRequest("process an invoice");
    return {
      reply: `I've handed this to **Finance**. They'll read the bill, categorize it and reconcile it against your ledger.`,
    };
  }
  if (lc.includes("follow up") || lc.includes("lead")) {
    workforceEngine.runLeadFlow();
    return {
      reply: `**Sales** is on a lead now — they'll open CRM, send follow-up and suggest calendar slots. Watch the Inbox to see the reply go out.`
    };
  }
  if (lc.includes("appointment") || lc.includes("book") || lc.includes("slot") || lc.includes("tomorrow")) {
    workforceEngine.runAppointmentFlow();
    return {
      reply: `**Support** is checking the calendar, **Sales** will confirm the slot and collect deposit, and **Marketing** will queue a reminder. You'll get a notification the moment it's booked.`
    };
  }
  return {
    reply: `Understood. I'm routing this across your departments now. Ask me anything specific — check inventory, close a lead, run an invoice, or activate a department — and I'll coordinate the real work for you.`,
    steps: stepsForIntent("general"),
  };
}

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<Omit<AIState, "dispatch">>(initialState);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const dispatch = React.useCallback((e: AIEvent) => {
    setState((s) => reducer({ ...s, dispatch: () => {} } as AIState, e));
  }, []);

  // Simulate AI response when the last message is from the user
  React.useEffect(() => {
    const last = state.conversation[state.conversation.length - 1];
    if (!last || last.role !== "user") return;
    const q = last.content;
    const steps = stepsForIntent(q);
    dispatch({ type: "THINKING_START", text: "Coordinating across departments…", steps });

    const timers: number[] = [];
    // Progress through steps visually
    steps.forEach((_, i) => {
      timers.push(window.setTimeout(() => {
        setState((s) => {
          const next = s.thinkingSteps.map((st, idx) =>
            idx <= i ? { ...st, status: "done" as const } :
            idx === i + 1 ? { ...st, status: "thinking" as const } : st
          );
          const texts = [
            "Understanding request…",
            "Checking relevant departments…",
            "Calling tools and gathering data…",
            "Coordinating handoffs…",
            "Finalizing response…",
          ];
          return { ...s, thinkingSteps: next, thinkingText: texts[Math.min(i + 1, texts.length - 1)] };
        });
      }, 400 + i * 450));
    });

    const reply = aiReplyFor(q);
    const totalDelay = 1200 + steps.length * 450;

    timers.push(window.setTimeout(() => {
      dispatch({ type: "AI_RESPONSE", content: reply.reply, steps: reply.steps });
      reply.action?.();
      // If activating a department, dispatch that event too
      for (const d of DEPARTMENTS) {
        if (q.toLowerCase().includes(d.name.toLowerCase()) && (q.toLowerCase().includes("activate") || q.toLowerCase().includes("wake"))) {
          dispatch({ type: "ACTIVATE_DEPT", dept: d.name });
          break;
        }
      }
    }, totalDelay));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.conversation.length, dispatch]);

  // Sync engine logs into activity
  React.useEffect(() => {
    const unsub = workforceEngine.subscribe((engine) => {
      // Only add timelines we haven't seen yet
      const lastState = stateRef.current;
      const known = new Set(lastState.activity.map((a) => a.id));
      engine.timeline.slice(0, 5).forEach((t) => {
        if (!known.has(t.id)) {
          // Map department name to tone
          const deptObj = DEPARTMENTS.find((d) => d.id === t.department);
          dispatch({
            type: "LOG",
            item: {
              dept: deptObj?.name ?? "System",
              deptTone: (deptToneMap[deptObj?.name ?? ""] ?? "brand"),
              agent: deptObj?.agents[0]?.name ?? "System",
              message: t.description || t.title,
              level: (t.status === "success" ? "success" : t.status === "warning" ? "warning" : t.status === "error" ? "error" : t.type === "tool_call" ? "task" : "info") as any,
            },
          });
        }
      });
    });
    return () => { unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AIContext.Provider value={{ ...state, dispatch }}>{children}</AIContext.Provider>
  );
}

export function useAI() {
  const ctx = React.useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used inside AIProvider");
  return ctx;
}
