import * as React from "react";
import { workforceEngine } from "./engine";
import { DEPARTMENTS } from "@/data/departments";
import { useAuth } from "@/contexts/AuthContext";

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

function getInitialMessage(businessName: string, ownerName: string): string {
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  const firstName = ownerName?.split(" ")[0] || "there";
  const business = businessName || "your business";

  return `${greeting}, ${firstName}. Your workforce is online across all departments. I'm ready to help coordinate ${business}. What would you like me to work on?`;
}

const initialState: Omit<AIState, "dispatch"> = {
  thinking: false,
  thinkingText: "",
  thinkingSteps: [],
  activeDept: null,
  activatingDept: null,
  commandOpen: false,
  copilotOpen: false,
  conversation: [],
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

// Seeded reasoning steps for department visualization
function stepsForIntent(): ReasoningStep[] {
  return [
    { label: "Support: Reading customer message", status: "pending" },
    { label: "Support: Reading Business Knowledge", status: "pending" },
    { label: "Operations: Checking inventory/services", status: "pending" },
    { label: "Finance: Calculating price if applicable", status: "pending" },
    { label: "Sales: Preparing customer response", status: "pending" },
    { label: "Sending reply to customer", status: "pending" },
  ];
}

// Business-related keywords to filter non-business questions
const BUSINESS_KEYWORDS = [
  "business", "company", "startup", "revenue", "sales", "customer", "client",
  "support", "marketing", "finance", "operations", "hr", "human resources",
  "employee", "team", "product", "service", "price", "pricing", "invoice",
  "payment", "order", "inventory", "stock", "lead", "prospect", "deal",
  "campaign", "advertising", "social media", "content", "brand", "growth",
  "automation", "workflow", "process", "efficiency", "cost", "profit",
  "budget", "expense", "tax", "compliance", "legal", "contract",
  "meeting", "schedule", "calendar", "appointment", "demo", "consultation",
  "integration", "tool", "software", "system", "platform", "api",
  "whatsapp", "email", "gmail", "shopify", "stripe", "razorpay", "hubspot",
  "zoho", "slack", "notion", "sheets", "calendar", "crm", "erp",
  "azolik", "ai", "agent", "department", "workforce", "task", "agent",
  "onboard", "hire", "recruit", "candidate", "interview", "offer",
  "policy", "leave", "payroll", "benefits", "training", "performance",
  "report", "analytics", "metric", "kpi", "dashboard", "insight",
  "customer support", "customer service", "help desk", "ticket",
  "faq", "knowledge base", "chatbot", "automation", "bot",
];

function isBusinessRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return BUSINESS_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

function getBusinessOnlyResponse(): string {
  const responses = [
    "I'm designed to help with business automation and workforce management. I can help you with:\n\n• Setting up AI departments (Support, Sales, Marketing, Finance, Operations, HR)\n• Connecting integrations (WhatsApp, Gmail, Shopify, Stripe, etc.)\n• Automating workflows and processes\n• Business analytics and reporting\n• Customer support automation\n• Lead generation and sales automation\n• Marketing campaign management\n• Financial operations and invoicing\n• HR and team management\n\nWhat would you like to work on for your business?",
    "I specialize in business automation with Azolik. I can help you build and manage your AI workforce, but I can't answer general questions outside of business operations.\n\nAsk me about:\n• How to set up your Support department\n• Connecting WhatsApp for customer messages\n• Creating sales automation workflows\n• Setting up marketing campaigns\n• Automating invoice generation\n• HR onboarding processes\n\nWhat business challenge are you trying to solve?",
    "I'm your AI business operations assistant. I'm here to help you automate and scale your business with AI departments.\n\nI can help with:\n📋 Department setup & configuration\n🔗 Tool integrations (WhatsApp, Gmail, Shopify, etc.)\n⚡ Workflow automation\n📊 Business analytics\n💰 Revenue & cost optimization\n👥 Team & HR management\n\nWhat would you like to automate today?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Call Gemini API with full business knowledge
async function callGemini(
  customerMessage: string,
  businessKnowledge: any,
  conversationHistory: Message[]
): Promise<string> {
  try {
    const previousConversation = conversationHistory
      .filter(m => m.role === "user" || m.role === "ai")
      .map(m => ({
        role: m.role === "user" ? "user" : "assistant" as const,
        content: m.content
      }));

    const response = await fetch("/api/ai/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        knowledge: {
          ...businessKnowledge,
          previousConversation,
          customerMessage,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`);
    }

    const data = await response.json();
    return data.reply || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini call failed:", error);
    return `I'm having trouble connecting to the AI service. Please check your configuration and try again.`;
  }
}

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<Omit<AIState, "dispatch">>(initialState);
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const { business, profile } = useAuth();

  const dispatch = React.useCallback((e: AIEvent) => {
    setState((s) => reducer({ ...s, dispatch: () => {} } as AIState, e));
  }, []);

  // Set initial message dynamically on mount
  React.useEffect(() => {
    if (state.conversation.length === 0) {
      const businessName = business?.name || workforceEngine.state.businessName;
      const ownerName = profile?.displayName || workforceEngine.state.ownerName;
      const message = getInitialMessage(businessName, ownerName);
      dispatch({
        type: "AI_RESPONSE",
        content: message,
      });
    }
  }, [business?.name, profile?.displayName, dispatch, state.conversation.length]);

  // Handle user messages - call Gemini with business knowledge
  React.useEffect(() => {
    const last = state.conversation[state.conversation.length - 1];
    if (!last || last.role !== "user") return;

    const customerMessage = last.content;
    
    // Check if message is business-related
    if (!isBusinessRelated(customerMessage)) {
      const businessResponse = getBusinessOnlyResponse();
      dispatch({ type: "AI_RESPONSE", content: businessResponse, steps: [] });
      return;
    }

    const steps = stepsForIntent();
    dispatch({ type: "THINKING_START", text: "Coordinating across departments…", steps });

    // Animate thinking steps
    const timers: number[] = [];
    steps.forEach((_, i) => {
      timers.push(window.setTimeout(() => {
        setState((s) => {
          const next = s.thinkingSteps.map((st, idx) =>
            idx <= i ? { ...st, status: "done" as const } :
            idx === i + 1 ? { ...st, status: "thinking" as const } : st
          );
          const texts = [
            "Support: Reading customer message…",
            "Support: Reading Business Knowledge…",
            "Operations: Checking inventory/services…",
            "Finance: Calculating price if applicable…",
            "Sales: Preparing customer response…",
            "Sending reply to customer…",
          ];
          return { ...s, thinkingSteps: next, thinkingText: texts[Math.min(i + 1, texts.length - 1)] };
        });
      }, 300 + i * 400));
    });

    // Build business knowledge from engine
    const engineState = workforceEngine.state;
    const industryTemplate = (workforceEngine as any).getIndustryTemplate?.();

    const businessKnowledge = {
      businessName: engineState.businessName,
      businessType: industryTemplate?.businessName || "business",
      businessDescription: `A ${industryTemplate?.businessName || "business"} operating in ${engineState.industry} industry.`,
      products: engineState.memory
        .filter(m => m.type === "product")
        .map(m => {
          try {
            const p = JSON.parse(m.value);
            return { name: p.name, price: p.price, stock: p.stock, unit: p.unit };
          } catch {
            return { name: m.key, price: 0, stock: 0 };
          }
        }),
      services: engineState.memory
        .filter(m => m.type === "service")
        .map(m => {
          try {
            const s = JSON.parse(m.value);
            return { name: s.name, price: s.price };
          } catch {
            return { name: m.key, price: 0 };
          }
        }),
      pricing: Object.fromEntries(
        engineState.memory
          .filter(m => m.type === "product")
          .map(m => {
            try {
              const p = JSON.parse(m.value);
              return [p.name, p.price];
            } catch {
              return [m.key, 0];
            }
          })
          .filter(([_, price]) => price > 0)
      ),
      openingHours: engineState.memory
        .find(m => m.key.includes("Working hours") || m.key.includes("hours") || m.key.includes("open"))
        ?.value || "Contact for hours",
      policies: engineState.memory
        .filter(m => m.type === "policy")
        .map(m => m.key),
    };

    const conversationHistory = state.conversation.slice(0, -1); // Exclude the current user message

    callGemini(customerMessage, businessKnowledge, conversationHistory).then((reply) => {
      timers.push(window.setTimeout(() => {
        dispatch({ type: "AI_RESPONSE", content: reply, steps });
      }, 800));
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.conversation.length, dispatch]);

  // Sync engine logs into activity
  React.useEffect(() => {
    const unsub = workforceEngine.subscribe((engine) => {
      const lastState = stateRef.current;
      const known = new Set(lastState.activity.map((a) => a.id));
      engine.timeline.slice(0, 5).forEach((t) => {
        if (!known.has(t.id)) {
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