// ============================================================
// Azolik Core Types — Real AI Workforce Platform
// ============================================================

export type DepartmentId = "support" | "sales" | "marketing" | "operations" | "finance" | "hr";

export type ToolId =
  | "whatsapp" | "gmail" | "sheets" | "calendar" | "shopify" | "woo"
  | "razorpay" | "stripe" | "notion" | "slack" | "discord" | "hubspot"
  | "zoho" | "outlook" | "faqs" | "inventory" | "orders" | "payments"
  | "invoices" | "expenses" | "crm" | "social" | "email_marketing" | "calendar_book";

export type ToolStatus = "idle" | "running" | "success" | "error";

export type ToolCall = {
  id: string;
  tool: ToolId;
  toolName: string;
  department: DepartmentId;
  status: ToolStatus;
  startedAt: number;
  completedAt?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
};

export type MemoryEntry = {
  id: string;
  type: "customer" | "product" | "policy" | "conversation" | "task" | "preference";
  key: string;
  value: string;
  source: DepartmentId;
  createdAt: number;
  lastAccessed?: number;
  accessCount: number;
  confidence: number;
};

export type Handoff = {
  id: string;
  from: DepartmentId;
  to: DepartmentId;
  task: string;
  status: "pending" | "in_progress" | "completed";
  startedAt: number;
  completedAt?: number;
  context: string;
};

export type Task = {
  id: string;
  title: string;
  department: DepartmentId;
  status: "queued" | "running" | "waiting_handoff" | "completed" | "failed";
  progress: number;
  startedAt: number;
  completedAt?: number;
  toolCalls: string[];
  handoffs: string[];
  assignee: string; // agent name
};

export type DepartmentAgent = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "active" | "idle" | "busy" | "training";
  tasksCompleted: number;
  successRate: number;
};

export type DepartmentConfig = {
  id: DepartmentId;
  name: string;
  tagline: string;
  personality: string;
  systemPrompt: string;
  icon: any; // lucide icon
  color: {
    primary: string;
    bg: string;
    text: string;
    glow: string;
  };
  tools: ToolId[];
  agents: DepartmentAgent[];
  permissions: string[];
  stats: {
    tasksToday: number;
    successRate: number;
    avgResponseTime: string;
    revenueGenerated?: number;
    customersHelped?: number;
    hoursSaved: number;
  };
  memory: {
    totalEntries: number;
    lastAccessed: number;
  };
  integrations: ToolId[];
  status: "active" | "idle" | "training" | "offline";
  onlineSince?: number;
};

export type WorkforceMetrics = {
  departmentsOnline: number;
  agentsWorking: number;
  tasksRunning: number;
  revenueGenerated: number;
  leadsClosed: number;
  customersHelped: number;
  hoursSaved: number;
  automationsCompleted: number;
  healthScore: number;
};

export type BusinessProfile = {
  name: string;
  owner: string;
  industry: string;
  size: string;
  founded: number;
  language: string;
  currency: string;
  timezone: string;
  products: number;
  employees: number;
};

export type TimelineEvent = {
  id: string;
  type: "tool_call" | "handoff" | "task_completed" | "decision" | "error" | "memory_update" | "integration_sync";
  department: DepartmentId;
  title: string;
  description: string;
  timestamp: number;
  status: "running" | "success" | "warning" | "error" | "info";
  metadata?: Record<string, unknown>;
};

export type IntegrationConfig = {
  id: ToolId;
  name: string;
  description: string;
  icon: any;
  category: "communication" | "crm" | "payments" | "productivity" | "ecommerce" | "marketing";
  connected: boolean;
  account?: string;
  permissions: string[];
  lastSync?: number;
  health: "healthy" | "degraded" | "error" | "disconnected";
  recentActivity: { event: string; timestamp: number }[];
  color: string;
};
