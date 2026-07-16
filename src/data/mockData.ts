import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  TrendingUp,
  Megaphone,
  Settings2,
  Calculator,
  Users,
} from "lucide-react";

export type Department = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  agents: number;
  tasksToday: number;
  status: "active" | "training" | "idle";
  health: number; // 0-100
  metric: { label: string; value: string; delta: string; positive: boolean };
  tone: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose";
};

export const DEPARTMENTS: Department[] = [
  {
    id: "support",
    name: "Support",
    description: "Resolve tickets 24/7 across email, chat and knowledge base.",
    icon: MessageSquare,
    iconColor: "text-cyan-200",
    iconBg: "from-cyan-500/30 to-cyan-700/10",
    agents: 0,
    tasksToday: 0,
    status: "idle",
    health: 0,
    metric: { label: "CSAT", value: "—", delta: "—", positive: true },
    tone: "cyan",
  },
  {
    id: "sales",
    name: "Sales",
    description: "Qualify leads, book meetings, and move opportunities forward.",
    icon: TrendingUp,
    iconColor: "text-emerald-200",
    iconBg: "from-emerald-500/30 to-emerald-700/10",
    agents: 0,
    tasksToday: 0,
    status: "idle",
    health: 0,
    metric: { label: "Pipeline", value: "—", delta: "—", positive: true },
    tone: "emerald",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Draft campaigns, publish content, and optimize channels.",
    icon: Megaphone,
    iconColor: "text-violet-200",
    iconBg: "from-violet-500/30 to-violet-700/10",
    agents: 0,
    tasksToday: 0,
    status: "idle",
    health: 0,
    metric: { label: "Reach", value: "—", delta: "—", positive: true },
    tone: "violet",
  },
  {
    id: "operations",
    name: "Operations",
    description: "Keep the engine running with process automation across tools.",
    icon: Settings2,
    iconColor: "text-amber-200",
    iconBg: "from-amber-500/30 to-amber-700/10",
    agents: 0,
    tasksToday: 0,
    status: "idle",
    health: 0,
    metric: { label: "On-time", value: "—", delta: "—", positive: true },
    tone: "amber",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Reconcile books, handle invoices, and forecast cash flow.",
    icon: Calculator,
    iconColor: "text-rose-200",
    iconBg: "from-rose-500/30 to-rose-700/10",
    agents: 0,
    tasksToday: 0,
    status: "idle",
    health: 0,
    metric: { label: "Burn", value: "—", delta: "—", positive: true },
    tone: "rose",
  },
  {
    id: "hr",
    name: "HR",
    description: "Answer policy questions, screen candidates, and onboard hires.",
    icon: Users,
    iconColor: "text-brand-200",
    iconBg: "from-brand-500/30 to-brand-700/10",
    agents: 0,
    tasksToday: 0,
    status: "idle",
    health: 0,
    metric: { label: "Time-to-hire", value: "—", delta: "—", positive: true },
    tone: "brand",
  },
];

export const ACTIVITY_DATA = [
  { time: "00:00", tasks: 0, conversations: 0 },
  { time: "03:00", tasks: 0, conversations: 0 },
  { time: "06:00", tasks: 0, conversations: 0 },
  { time: "09:00", tasks: 0, conversations: 0 },
  { time: "12:00", tasks: 0, conversations: 0 },
  { time: "15:00", tasks: 0, conversations: 0 },
  { time: "18:00", tasks: 0, conversations: 0 },
  { time: "21:00", tasks: 0, conversations: 0 },
  { time: "Now",   tasks: 0, conversations: 0 },
];

export const HEALTH_DATA = [
  { day: "Mon", health: 0 },
  { day: "Tue", health: 0 },
  { day: "Wed", health: 0 },
  { day: "Thu", health: 0 },
  { day: "Fri", health: 0 },
  { day: "Sat", health: 0 },
  { day: "Sun", health: 0 },
];

export const RECENT_AUTOMATIONS = [] as const;

export const NOTIFICATIONS = [] as const;

export const RECENT_CONVERSATIONS = [] as const;

export const QUICK_ACTIONS = [
  { label: "Build new agent", hint: "Design a custom AI worker", tone: "brand" as const },
  { label: "Launch automation", hint: "Connect tools & triggers", tone: "violet" as const },
  { label: "Add integration", hint: "Connect Slack, Salesforce…", tone: "cyan" as const },
  { label: "Invite teammate", hint: "Add seats to workspace", tone: "emerald" as const },
];
