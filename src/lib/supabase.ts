import { 
  createClient, 
  type SupabaseClient,
  type PostgrestError 
} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabase;
}

export const sb = getSupabase();

// ==================== TYPES ====================

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  phone?: string;
  role: "owner" | "admin" | "manager" | "employee";
  business_id?: string;
  onboarding_complete: boolean;
  onboarding_step: number;
  preferences: {
    notifications: { email: boolean; push: boolean; sms: boolean };
    theme: "dark" | "light" | "auto";
    language: string;
    timezone: string;
  };
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface BusinessProfile {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  currency: string;
  timezone: string;
  gstin?: string;
  website?: string;
  logo_url?: string;
  settings: {
    auto_reply: boolean;
    business_hours: {
      enabled: boolean;
      timezone: string;
      schedule: Record<string, { open: string; close: string; closed: boolean }>;
    };
    auto_invoice: boolean;
    tax_rate: number;
    currency_format: string;
  };
  integrations: Record<string, IntegrationConfig>;
  departments: string[];
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  connected: boolean;
  config?: Record<string, any>;
  last_sync?: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface Department {
  id: string;
  business_id: string;
  type: "support" | "sales" | "marketing" | "finance" | "operations" | "hr";
  name: string;
  description: string;
  enabled: boolean;
  agents: Agent[];
  tools: string[];
  config: Record<string, any>;
  stats: {
    tasks_today: number;
    completed_today: number;
    pending: number;
    avg_response_time: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: "active" | "idle" | "busy" | "offline";
  tasks_completed: number;
  success_rate: number;
  last_active: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  channel: "whatsapp" | "email" | "instagram" | "sms" | "web";
  status: "open" | "pending" | "closed" | "assigned";
  assigned_to?: string;
  department: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "customer" | "agent" | "ai" | "system";
  sender_name: string;
  content: string;
  type: "text" | "image" | "document" | "audio" | "location" | "contact" | "template";
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Task {
  id: string;
  business_id: string;
  department: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "waiting_approval" | "completed" | "failed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  created_by: string;
  due_at?: string;
  started_at?: string;
  completed_at?: string;
  metadata: Record<string, any>;
  steps: TaskStep[];
  created_at: string;
  updated_at: string;
}

export interface TaskStep {
  id: string;
  task_id: string;
  name: string;
  type: "tool_call" | "handoff" | "approval" | "notification" | "data_fetch" | "data_write";
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
}

export interface InventoryItem {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
  max_stock?: number;
  supplier?: string;
  barcode?: string;
  images: string[];
  variants: InventoryVariant[];
  status: "active" | "inactive" | "discontinued";
  created_at: string;
  updated_at: string;
}

export interface InventoryVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Lead {
  id: string;
  business_id: string;
  source: "whatsapp" | "email" | "phone" | "web" | "referral" | "walkin" | "social";
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value: number;
  currency: string;
  assigned_to?: string;
  tags: string[];
  notes: string;
  next_follow_up_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  address?: string;
  gstin?: string;
  tags: string[];
  total_orders: number;
  total_spent: number;
  currency: string;
  last_order_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate: number;
  sku?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  business_id: string;
  type: "info" | "success" | "warning" | "error" | "approval" | "task" | "message";
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface WebhookEvent {
  id: string;
  business_id: string;
  source: "razorpay" | "stripe" | "shopify" | "woocommerce" | "zoho" | "hubspot" | "slack" | "whatsapp" | "gmail";
  event: string;
  payload: Record<string, any>;
  processed: boolean;
  processed_at?: string;
  error?: string;
  created_at: string;
}

export interface AnalyticsData {
  date: string;
  revenue_assisted: number;
  customers_helped: number;
  appointments_booked: number;
  orders_closed: number;
  hours_saved: number;
  messages_answered: number;
  avg_response_time: number;
  success_rate: number;
  automations_completed: number;
  department_stats: Record<string, {
    tasks_today: number;
    completed_today: number;
    success_rate: number;
  }>;
  top_agents: Array<{
    name: string;
    department: string;
    tasks: number;
    success_rate: number;
  }>;
}

export interface KnowledgeBaseItem {
  id: string;
  business_id: string;
  category: "products" | "services" | "faqs" | "inventory" | "payments" | "policies" | "custom";
  title: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface AIWorkflowExecution {
  id: string;
  business_id: string;
  department: string;
  trigger_type: "message" | "schedule" | "webhook" | "manual";
  trigger_data: Record<string, any>;
  status: "running" | "completed" | "failed" | "paused";
  steps: WorkflowStep[];
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface WorkflowStep {
  id: string;
  execution_id: string;
  name: string;
  type: "read_knowledge" | "generate_reply" | "update_crm" | "book_appointment" | "create_invoice" | "send_message" | "create_task" | "custom";
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  started_at?: string;
  completed_at?: string;
}

export interface OnboardingData {
  businessName: string;
  businessType: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  currency: string;
  timezone: string;
  integrations: string[];
  departments: string[];
  knowledge: Record<string, any>;
}

// ==================== HELPER FUNCTIONS ====================

export function createDefaultUserProfile(authUserId: string, email: string, displayName: string): Omit<UserProfile, "id" | "created_at" | "updated_at"> {
  return {
    auth_user_id: authUserId,
    email,
    display_name: displayName,
    role: "owner",
    onboarding_complete: false,
    onboarding_step: 0,
    preferences: {
      notifications: { email: true, push: true, sms: false },
      theme: "dark",
      language: "en",
      timezone: "Asia/Kolkata",
    },
    last_login_at: new Date().toISOString(),
  };
}

export function createDefaultBusinessProfile(ownerId: string, data: OnboardingData): Omit<BusinessProfile, "id" | "created_at" | "updated_at"> {
  return {
    owner_id: ownerId,
    name: data.businessName,
    type: data.businessType,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    postal_code: data.postalCode,
    latitude: data.latitude,
    longitude: data.longitude,
    place_id: data.placeId,
    currency: data.currency,
    timezone: data.timezone,
    settings: {
      auto_reply: true,
      business_hours: {
        enabled: true,
        timezone: data.timezone,
        schedule: {
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { open: "09:00", close: "14:00", closed: false },
          sunday: { open: "10:00", close: "14:00", closed: true },
        },
      },
      auto_invoice: true,
      tax_rate: 18,
      currency_format: "₹",
    },
    integrations: {},
    departments: data.departments,
  };
}

function getDepartmentName(type: string): string {
  const names: Record<string, string> = {
    support: "Support",
    sales: "Sales",
    marketing: "Marketing",
    finance: "Finance",
    operations: "Operations",
    hr: "HR",
  };
  return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function getDepartmentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    support: "Customer messages, FAQs, order tracking, escalations",
    sales: "Lead qualification, quotes, follow-ups, payment collection",
    marketing: "Content creation, social media, email campaigns, ads",
    finance: "Invoice processing, expense tracking, reconciliation",
    operations: "Inventory sync, order processing, vendor coordination",
    hr: "Hiring, onboarding, attendance, payroll, policies",
  };
  return descriptions[type] || "";
}

function getDepartmentTools(type: string): string[] {
  const tools: Record<string, string[]> = {
    support: ["whatsapp", "faqs", "inventory", "orders", "calendar_book", "gmail"],
    sales: ["crm", "gmail", "payments", "calendar", "hubspot", "zoho"],
    marketing: ["social", "email_marketing", "calendar", "slack", "notion", "shopify"],
    finance: ["gmail", "sheets", "invoices", "expenses", "razorpay", "stripe"],
    operations: ["inventory", "orders", "shopify", "woo", "slack", "notion"],
    hr: ["gmail", "calendar", "sheets", "slack", "notion", "outlook"],
  };
  return tools[type] || [];
}

export function createDefaultDepartments(businessId: string, departmentTypes: string[]): Omit<Department, "id" | "created_at" | "updated_at">[] {
  return departmentTypes.map(type => ({
    business_id: businessId,
    type: type as Department["type"],
    name: getDepartmentName(type),
    description: getDepartmentDescription(type),
    enabled: true,
    agents: [],
    tools: getDepartmentTools(type),
    config: {},
    stats: { tasks_today: 0, completed_today: 0, pending: 0, avg_response_time: 0 },
  }));
}