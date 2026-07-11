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
    agents: 12,
    tasksToday: 1284,
    status: "active",
    health: 96,
    metric: { label: "CSAT", value: "96%", delta: "+2.4%", positive: true },
    tone: "cyan",
  },
  {
    id: "sales",
    name: "Sales",
    description: "Qualify leads, book meetings, and move opportunities forward.",
    icon: TrendingUp,
    iconColor: "text-emerald-200",
    iconBg: "from-emerald-500/30 to-emerald-700/10",
    agents: 8,
    tasksToday: 642,
    status: "active",
    health: 88,
    metric: { label: "Pipeline", value: "$1.2M", delta: "+12%", positive: true },
    tone: "emerald",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Draft campaigns, publish content, and optimize channels.",
    icon: Megaphone,
    iconColor: "text-violet-200",
    iconBg: "from-violet-500/30 to-violet-700/10",
    agents: 6,
    tasksToday: 328,
    status: "training",
    health: 74,
    metric: { label: "Reach", value: "284K", delta: "+8.1%", positive: true },
    tone: "violet",
  },
  {
    id: "operations",
    name: "Operations",
    description: "Keep the engine running with process automation across tools.",
    icon: Settings2,
    iconColor: "text-amber-200",
    iconBg: "from-amber-500/30 to-amber-700/10",
    agents: 9,
    tasksToday: 903,
    status: "active",
    health: 92,
    metric: { label: "On-time", value: "99.2%", delta: "+0.3%", positive: true },
    tone: "amber",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Reconcile books, handle invoices, and forecast cash flow.",
    icon: Calculator,
    iconColor: "text-rose-200",
    iconBg: "from-rose-500/30 to-rose-700/10",
    agents: 4,
    tasksToday: 187,
    status: "active",
    health: 81,
    metric: { label: "Burn", value: "$142K", delta: "-3.6%", positive: true },
    tone: "rose",
  },
  {
    id: "hr",
    name: "HR",
    description: "Answer policy questions, screen candidates, and onboard hires.",
    icon: Users,
    iconColor: "text-brand-200",
    iconBg: "from-brand-500/30 to-brand-700/10",
    agents: 5,
    tasksToday: 142,
    status: "idle",
    health: 68,
    metric: { label: "Time-to-hire", value: "11d", delta: "-2d", positive: true },
    tone: "brand",
  },
];

export const ACTIVITY_DATA = [
  { time: "00:00", tasks: 120, conversations: 80 },
  { time: "03:00", tasks: 80, conversations: 60 },
  { time: "06:00", tasks: 220, conversations: 140 },
  { time: "09:00", tasks: 520, conversations: 320 },
  { time: "12:00", tasks: 780, conversations: 480 },
  { time: "15:00", tasks: 910, conversations: 560 },
  { time: "18:00", tasks: 740, conversations: 420 },
  { time: "21:00", tasks: 390, conversations: 240 },
  { time: "Now",   tasks: 450, conversations: 290 },
];

export const HEALTH_DATA = [
  { day: "Mon", health: 82 },
  { day: "Tue", health: 85 },
  { day: "Wed", health: 79 },
  { day: "Thu", health: 88 },
  { day: "Fri", health: 91 },
  { day: "Sat", health: 87 },
  { day: "Sun", health: 93 },
];

export const RECENT_AUTOMATIONS = [
  { id: 1, name: "Triage incoming support tickets", dept: "Support", status: "running", runs: 1243, success: 99.8 },
  { id: 2, name: "Lead enrichment & routing", dept: "Sales", status: "running", runs: 412, success: 98.1 },
  { id: 3, name: "Weekly content brief generation", dept: "Marketing", status: "scheduled", runs: 8, success: 100 },
  { id: 4, name: "Invoice anomaly detection", dept: "Finance", status: "paused", runs: 67, success: 94.3 },
  { id: 5, name: "Candidate resume screener", dept: "HR", status: "running", runs: 248, success: 96.9 },
] as const;

export const NOTIFICATIONS = [
  { id: 1, type: "success", title: "Sales closed deal with Acme Corp", time: "2m ago", tone: "emerald" as const },
  { id: 2, type: "info", title: "Marketing campaign draft ready for review", time: "14m ago", tone: "violet" as const },
  { id: 3, type: "warning", title: "3 invoices flagged for review", time: "1h ago", tone: "amber" as const },
  { id: 4, type: "info", title: "New integration: Salesforce connected", time: "3h ago", tone: "brand" as const },
  { id: 5, type: "error", title: "HR agent retraining recommended", time: "5h ago", tone: "rose" as const },
];

export const RECENT_CONVERSATIONS = [
  { id: 1, name: "Priya Sharma", channel: "Website chat", dept: "Support", message: "I can't find my order confirmation — can you resend it?", time: "just now", tone: "cyan" as const, status: "online" as const },
  { id: 2, name: "Marcus Chen", channel: "Email", dept: "Sales", message: "Can we jump on a call this week to discuss enterprise pricing?", time: "5m ago", tone: "emerald" as const, status: "online" as const },
  { id: 3, name: "Elena Rossi", channel: "Slack", dept: "Operations", message: "The vendor onboarding flow is looking great. Approved!", time: "22m ago", tone: "amber" as const, status: "idle" as const },
  { id: 4, name: "Jordan Blake", channel: "LinkedIn", dept: "Marketing", message: "Loving the new product launch post. Great work team!", time: "1h ago", tone: "violet" as const, status: "offline" as const },
];

export const QUICK_ACTIONS = [
  { label: "Build new agent", hint: "Design a custom AI worker", tone: "brand" as const },
  { label: "Launch automation", hint: "Connect tools & triggers", tone: "violet" as const },
  { label: "Add integration", hint: "Connect Slack, Salesforce…", tone: "cyan" as const },
  { label: "Invite teammate", hint: "Add seats to workspace", tone: "emerald" as const },
];
