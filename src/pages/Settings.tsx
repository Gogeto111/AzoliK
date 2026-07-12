import * as React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import {
  User,
  CreditCard,
  Lock,
  Bell,
  Palette,
  Key as KeyIcon,
  Building2,
  ChevronRight,
  Check,
  Globe,
  Languages,
  Shield,
  Bot,
  Moon,
  Sun,
  Monitor as MonitorIcon,
  Zap,
  MessageSquare,
  CalendarDays,
  Volume2,
  Mail,
  Phone,
  Save,
  X,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Copy as CopyIcon,
  RefreshCw,
  ExternalLink,
  Unplug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { db, doc, getDoc, updateDoc } from "@/lib/firebase";

interface IntegrationConfig {
  connected: boolean;
  config?: Record<string, any>;
  last_sync?: string;
  status: "connected" | "disconnected" | "error";
}

interface SettingSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string;
}

const SETTINGS_SECTIONS: SettingSection[] = [
  { id: "profile", label: "Profile", icon: User, description: "Your name, photo, email, and role" },
  { id: "business", label: "Business", icon: Building2, description: "Business name, industry, hours, address" },
  { id: "departments", label: "Departments", icon: Bot, description: "Manage departments, agents, and permissions" },
  { id: "permissions", label: "Permissions", icon: Shield, description: "Team roles, access levels, and approvals" },
  { id: "integrations", label: "Integrations", icon: Zap, description: "Connected tools and API credentials" },
  { id: "languages", label: "Languages", icon: Languages, description: "Supported languages and translations" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Email, push, and in-app preferences" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Theme, density, and display options" },
  { id: "billing", label: "Billing", icon: CreditCard, description: "Plan, payment method, and invoices" },
  { id: "security", label: "Security", icon: Lock, description: "Password, 2FA, and session management" },
  { id: "api", label: "API Keys", icon: KeyIcon, description: "Developer keys and webhook endpoints" },
];

interface Industry {
  id: string;
  name: string;
  emoji: string;
}

const INDUSTRIES: Industry[] = [
  { id: "bakery", name: "Bakery", emoji: "🥖" },
  { id: "dental", name: "Dental Clinic", emoji: "🦷" },
  { id: "gym", name: "Gym & Fitness", emoji: "💪" },
  { id: "restaurant", name: "Restaurant", emoji: "🍽️" },
  { id: "ecommerce", name: "E-commerce", emoji: "📦" },
  { id: "agency", name: "Creative Agency", emoji: "🎨" },
];

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
];

interface Timezone {
  value: string;
  label: string;
}

const TIMEZONES: Timezone[] = [
  { value: "Asia/Kolkata", label: "IST (UTC+5:30) - India" },
  { value: "America/New_York", label: "EST (UTC-5) - New York" },
  { value: "America/Los_Angeles", label: "PST (UTC-8) - Los Angeles" },
  { value: "Europe/London", label: "GMT (UTC+0) - London" },
  { value: "Europe/Berlin", label: "CET (UTC+1) - Berlin" },
  { value: "Asia/Dubai", label: "GST (UTC+4) - Dubai" },
  { value: "Asia/Singapore", label: "SGT (UTC+8) - Singapore" },
  { value: "Australia/Sydney", label: "AEST (UTC+10) - Sydney" },
];

export default function Settings() {
  const [active, setActive] = useState<string>("profile");
  const [saving, setSaving] = useState(false);
  const { profile: authProfile, business: authBusiness } = useAuth();

  // Profile form state - initialized from auth data
  const [profile, setProfile] = useState({
    firstName: authProfile?.displayName?.split(" ")[0] || "",
    lastName: authProfile?.displayName?.split(" ").slice(1).join(" ") || "",
    email: authProfile?.email || "",
    role: authProfile?.role || "Owner",
    phone: authProfile?.phoneNumber || "",
    avatar: null as string | null,
  });

  // Business form state - initialized from auth data
  const [business, setBusiness] = useState({
    name: authBusiness?.name || "",
    industry: authBusiness?.type || "",
    timezone: authBusiness?.timezone || "Asia/Kolkata",
    address: authBusiness?.address || "",
    phone: authBusiness?.phone || "",
    website: authBusiness?.website || "",
    gstin: authBusiness?.gstin || "",
    openingHours: "Tue–Sun, 8:00 AM – 10:00 PM",
    currency: authBusiness?.currency || "INR",
  });

  interface Department {
    id: string;
    name: string;
    enabled: boolean;
    agents: number;
    color: string;
  }

  const [departments, setDepartments] = useState<Department[]>([
    { id: "support", name: "Support", enabled: true, agents: 4, color: "cyan" },
    { id: "sales", name: "Sales", enabled: true, agents: 3, color: "emerald" },
    { id: "marketing", name: "Marketing", enabled: true, agents: 3, color: "violet" },
    { id: "finance", name: "Finance", enabled: true, agents: 2, color: "rose" },
    { id: "operations", name: "Operations", enabled: true, agents: 3, color: "amber" },
    { id: "hr", name: "HR", enabled: false, agents: 2, color: "brand" },
  ]);

  interface Permissions {
    autoApprove: boolean;
    requireApprovalFor: string[];
    defaultAssignee: string;
    escalationTimeout: number;
  }

  const [permissions, setPermissions] = useState<Permissions>({
    autoApprove: false,
    requireApprovalFor: ["payments", "refunds", "discounts", "hiring"],
    defaultAssignee: "ai",
    escalationTimeout: 30,
  });

  interface Notifications {
    email: { newMessage: boolean; approvals: boolean; dailySummary: boolean; weeklyReport: boolean; alerts: boolean };
    push: { newMessage: boolean; approvals: boolean; mentions: boolean; completed: boolean };
    inApp: { sound: boolean; desktop: boolean; badge: boolean };
  }

  const [notifications, setNotifications] = useState<Notifications>({
    email: { newMessage: true, approvals: true, dailySummary: true, weeklyReport: false, alerts: true },
    push: { newMessage: true, approvals: true, mentions: true, completed: false },
    inApp: { sound: true, desktop: true, badge: true },
  });

  interface Appearance {
    theme: "dark" | "light" | "auto";
    density: "compact" | "comfortable" | "spacious";
    animations: boolean;
    reducedMotion: boolean;
    compactSidebar: boolean;
  }

  const [appearance, setAppearance] = useState<Appearance>({
    theme: "dark",
    density: "comfortable",
    animations: true,
    reducedMotion: false,
    compactSidebar: false,
  });

  interface Billing {
    plan: string;
    status: string;
    nextBilling: string;
    paymentMethod: string;
    seats: number;
    pricePerSeat: number;
  }

  const [billing, setBilling] = useState<Billing>({
    plan: "Free",
    status: "active",
    nextBilling: "",
    paymentMethod: "",
    seats: 1,
    pricePerSeat: 0,
  });

  interface Security {
    twoFA: boolean;
    sessions: Array<{
      device: string;
      location: string;
      current: boolean;
      lastActive: string;
    }>;
  }

  const [security, setSecurity] = useState<Security>({
    twoFA: false,
    sessions: [
      { device: "Current browser", location: "Current location", current: true, lastActive: "Now" },
    ],
  });

  interface ApiKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string;
    scopes: string[];
  }

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const handleSave = async (section: string) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, workspace, billing, and preferences."
      />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <GlassCard noPadding className="p-2">
          <nav className="flex flex-col gap-0.5 p-1">
            {SETTINGS_SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2 text-left text-[13.5px] font-medium transition-colors",
                    isActive ? "text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] ring-1 ring-inset ring-white/10" />
                  )}
                  <Icon className={cn("h-4 w-4", isActive ? "text-brand-300" : "text-ink-400")} strokeWidth={2} />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </GlassCard>

        {/* Content */}
        <div className="space-y-5">
          {active === "profile" && <ProfileSection profile={profile} setProfile={setProfile} onSave={() => handleSave("profile")} saving={saving} />}
          {active === "business" && <BusinessSection business={business} setBusiness={setBusiness} onSave={() => handleSave("business")} saving={saving} />}
          {active === "departments" && <DepartmentsSection departments={departments} setDepartments={setDepartments} />}
          {active === "permissions" && <PermissionsSection permissions={permissions} setPermissions={setPermissions} />}
          {active === "integrations" && <IntegrationsSection />}
          {active === "languages" && <LanguagesSection />}
          {active === "notifications" && <NotificationsSection notifications={notifications} setNotifications={setNotifications} />}
          {active === "appearance" && <AppearanceSection appearance={appearance} setAppearance={setAppearance} />}
          {active === "billing" && <BillingSection billing={billing} />}
          {active === "security" && <SecuritySection security={security} />}
          {active === "api" && <APIKeysSection apiKeys={apiKeys} setApiKeys={setApiKeys} />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ profile, setProfile, onSave, saving }: { profile: any; setProfile: any; onSave: any; saving: boolean }) {
  return (
    <>
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Profile</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">This information will be shown across your workspace.</p>
        <div className="mt-6 flex items-center gap-5">
          <Avatar name={`${profile.firstName} ${profile.lastName}` || "User"} tone="brand" size="xl" status="online" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Upload photo</Button>
            <Button size="sm" variant="ghost">Remove</Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="First name" value={profile.firstName} onChange={(v: string) => setProfile({ ...profile, firstName: v })} />
          <Field label="Last name" value={profile.lastName} onChange={(v: string) => setProfile({ ...profile, lastName: v })} />
          <Field label="Email" value={profile.email} onChange={(v: string) => setProfile({ ...profile, email: v })} type="email" />
          <Field label="Role" value={profile.role} onChange={(v: string) => setProfile({ ...profile, role: v })} />
          <Field label="Phone" value={profile.phone} onChange={(v: string) => setProfile({ ...profile, phone: v })} type="tel" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => {}}>Cancel</Button>
          <Button variant="primary" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save changes
          </Button>
        </div>
      </GlassCard>
    </>
  );
}

function BusinessSection({ business, setBusiness, onSave, saving }: { business: any; setBusiness: any; onSave: any; saving: boolean }) {
  return (
    <GlassCard className="p-6 space-y-6">
      <h3 className="text-[15px] font-semibold text-white">Business Information</h3>
      <p className="text-[12.5px] text-ink-400">Your business details used across departments and customer communications.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Business Name" value={business.name} onChange={(v: string) => setBusiness({ ...business, name: v })} />
        <Field
          label="Industry"
          value={business.industry}
          onChange={(v: string) => setBusiness({ ...business, industry: v })}
          asSelect
          options={INDUSTRIES.map(i => ({ value: i.id, label: `${i.emoji} ${i.name}` }))}
        />
        <Field label="Timezone" value={business.timezone} onChange={(v: string) => setBusiness({ ...business, timezone: v })} asSelect options={TIMEZONES.map(t => ({ value: t.value, label: t.label }))} />
        <Field label="Currency" value={business.currency} onChange={(v: string) => setBusiness({ ...business, currency: v })} asSelect options={[{value:"INR",label:"₹ INR"},{value:"USD",label:"$ USD"},{value:"EUR",label:"€ EUR"},{value:"GBP",label:"£ GBP"}]} />
      </div>

      <Field label="Address" value={business.address} onChange={(v: string) => setBusiness({ ...business, address: v })} multiline rows={2} fullWidth />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Phone" value={business.phone} onChange={(v: string) => setBusiness({ ...business, phone: v })} type="tel" />
        <Field label="Website" value={business.website} onChange={(v: string) => setBusiness({ ...business, website: v })} type="url" />
        <Field label="GSTIN" value={business.gstin} onChange={(v: string) => setBusiness({ ...business, gstin: v })} />
      </div>
      <Field label="Opening Hours" value={business.openingHours} onChange={(v: string) => setBusiness({ ...business, openingHours: v })} fullWidth />

      <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={() => {}}>Cancel</Button>
        <Button variant="primary" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save changes
        </Button>
      </div>
    </GlassCard>
  );
}

function DepartmentsSection({ departments, setDepartments }: { departments: any[]; setDepartments: any }) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Departments</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Enable or disable departments. Each department comes with specialized agents and tools.</p>
        <div className="mt-4 space-y-3">
          {departments.map((d) => (
            <DepartmentRow key={d.id} dept={d} onToggle={(enabled: boolean) => setDepartments(departments.map(x => x.id === d.id ? { ...x, enabled } : x))} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Agent Management</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Configure agents within each department. Changes take effect immediately.</p>
        <div className="mt-4 space-y-3">
          {departments.filter(d => d.enabled).map((d) => (
            <DepartmentAgents key={d.id} dept={d} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function DepartmentRow({ dept, onToggle }: { dept: any; onToggle: (enabled: boolean) => void }) {
  const colors: Record<string, string> = {
    cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
    rose: "from-rose-500/30 to-rose-700/10 text-rose-200",
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10 ${colors[dept.color]}`}>
          <Bot className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="font-medium text-white">{dept.name}</div>
          <div className="text-[11.5px] text-ink-400">{dept.agents} agents • {dept.enabled ? "Active" : "Disabled"}</div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={dept.enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
      </label>
    </div>
  );
}

function DepartmentAgents({ dept }: { dept: any }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10 ${dept.color === "cyan" ? "from-cyan-500/30 to-cyan-700/10 text-cyan-200" : dept.color === "emerald" ? "from-emerald-500/30 to-emerald-700/10 text-emerald-200" : dept.color === "violet" ? "from-violet-500/30 to-violet-700/10 text-violet-200" : dept.color === "amber" ? "from-amber-500/30 to-amber-700/10 text-amber-200" : dept.color === "rose" ? "from-rose-500/30 to-rose-700/10 text-rose-200" : "from-brand-500/30 to-brand-700/10 text-brand-200"}`}>
            <Bot className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-white">{dept.name} ({dept.agents} agents)</span>
        </div>
        <Button size="sm" variant="ghost">Manage agents</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: dept.agents }, (_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
            <span className="text-[12px] font-medium text-white">Agent {i + 1}</span>
            <span className="text-[10.5px] text-ink-400">Specialist</span>
            <Badge tone="emerald" size="xs" dot>Active</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionsSection({ permissions, setPermissions }: { permissions: any; setPermissions: any }) {
  return (
    <GlassCard className="p-6 space-y-6">
      <h3 className="text-[15px] font-semibold text-white">Permissions & Approvals</h3>
      <p className="text-[12.5px] text-ink-400">Configure how your AI workforce handles sensitive actions.</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div>
            <div className="font-medium text-white">Auto-approve low-risk actions</div>
            <div className="text-[12px] text-ink-400">Allow AI to complete routine tasks without owner approval</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={permissions.autoApprove}
              onChange={(e) => setPermissions({ ...permissions, autoApprove: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium text-white">Require approval for</div>
              <div className="text-[12px] text-ink-400">Actions that need owner sign-off before execution</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["payments", "refunds", "discounts", "hiring", "contracts", "data_export", "settings"].map((action) => (
              <label key={action} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 cursor-pointer hover:border-white/10">
                <input
                  type="checkbox"
                  checked={permissions.requireApprovalFor.includes(action)}
                  onChange={(e) => setPermissions({
                    ...permissions,
                    requireApprovalFor: e.target.checked
                      ? [...permissions.requireApprovalFor, action]
                      : permissions.requireApprovalFor.filter((a: string) => a !== action)
                  })}
                  className="sr-only peer"
                />
                <span className="text-[12px] text-white capitalize">{action.replace("_", " ")}</span>
                <div className="w-4 h-4 rounded border border-white/20 peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:after:content-['✓'] after:absolute after:flex after:items-center after:justify-center after:text-[10px] after:text-white"></div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Default task assignee" asSelect value={permissions.defaultAssignee} onChange={(v: string) => setPermissions({ ...permissions, defaultAssignee: v })} options={[{value:"ai",label:"AI (auto-assign)"},{value:"owner",label:"Me (owner)"},{value:"round-robin",label:"Round-robin"}]} />
          <Field label="Escalation timeout (minutes)" value={String(permissions.escalationTimeout)} onChange={(v: string) => setPermissions({ ...permissions, escalationTimeout: parseInt(v) || 30 })} type="number" />
        </div>
      </div>
    </GlassCard>
  );
}

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: typeof Mail;
  requiresOAuth: boolean;
  scopes?: string[];
}

const INTEGRATIONS_LIST: IntegrationItem[] = [
  { id: "gmail", name: "Gmail", description: "Email automation & inbox management", category: "Communication", icon: Mail, requiresOAuth: true, scopes: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"] },
  { id: "google_sheets", name: "Google Sheets", description: "Data sync, reports & inventory", category: "Productivity", icon: Mail, requiresOAuth: true, scopes: ["https://www.googleapis.com/auth/spreadsheets"] },
  { id: "google_calendar", name: "Google Calendar", description: "Appointment scheduling & availability", category: "Productivity", icon: CalendarDays, requiresOAuth: true, scopes: ["https://www.googleapis.com/auth/calendar"] },
  { id: "whatsapp", name: "WhatsApp Business", description: "Customer messaging & support", category: "Communication", icon: MessageSquare, requiresOAuth: false },
  { id: "shopify", name: "Shopify", description: "E-commerce orders & inventory", category: "Commerce", icon: Mail, requiresOAuth: false },
  { id: "razorpay", name: "Razorpay", description: "Payments & invoicing", category: "Commerce", icon: CreditCard, requiresOAuth: false },
  { id: "hubspot", name: "HubSpot", description: "CRM, contacts & pipelines", category: "CRM", icon: Mail, requiresOAuth: false },
];

function IntegrationsSection() {
  const { profile } = useAuth();
  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, IntegrationConfig>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.businessId) return;
    (async () => {
      const bizSnap = await getDoc(doc(db, "businesses", profile.businessId!));
      const bizData = bizSnap.data();
      if (bizData?.integrations) setConnectedIntegrations(bizData.integrations);
      setLoading(false);
    })();
  }, [profile?.businessId]);

  const saveIntegration = async (integrationId: string, config: IntegrationConfig) => {
    if (!profile?.businessId) return;
    const updated = { ...connectedIntegrations, [integrationId]: config };
    await updateDoc(doc(db, "businesses", profile.businessId), {
      integrations: updated,
      updatedAt: Date.now(),
    });
    setConnectedIntegrations(updated);
  };

  const handleConnect = (item: IntegrationItem) => {
    if (item.requiresOAuth) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) { alert("Google OAuth not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment."); return; }
      const state = `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = (item.scopes || []).join(" ");
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent&state=${state}`;
    } else {
      setActionLoading(item.id);
      setTimeout(async () => {
        await saveIntegration(item.id, { connected: true, last_sync: new Date().toISOString(), status: "connected" });
        setActionLoading(null);
      }, 800);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setActionLoading(integrationId);
    await saveIntegration(integrationId, { connected: false, status: "disconnected" });
    setActionLoading(null);
  };

  const connectedCount = Object.values(connectedIntegrations).filter(i => i?.connected).length;

  return (
    <div className="space-y-5">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Connected Integrations</h3>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              {connectedCount} of {INTEGRATIONS_LIST.length} integrations connected
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => window.location.href = "/integrations"}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Connect New Tool
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-brand-300 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {INTEGRATIONS_LIST.map((item) => {
              const config = connectedIntegrations[item.id];
              const isConnected = config?.connected === true;
              const isWorking = actionLoading === item.id;
              const Icon = item.icon;

              return (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10", isConnected ? "bg-emerald-500/15" : "bg-white/[0.04]")}>
                      <Icon className={cn("h-5 w-5", isConnected ? "text-emerald-300" : "text-ink-400")} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-white">{item.name}</span>
                        {isConnected && <Badge tone="emerald" size="xs" dot>Connected</Badge>}
                        {!isConnected && <Badge tone="default" size="xs">Disconnected</Badge>}
                      </div>
                      <div className="text-[12px] text-ink-400 mt-0.5">{item.description}</div>
                      {isConnected && config?.last_sync && (
                        <div className="text-[11px] text-ink-500 mt-1">
                          Last synced {new Date(config.last_sync).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleDisconnect(item.id)} disabled={isWorking} className="text-rose-300 hover:text-rose-100">
                          {isWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Unplug className="h-3.5 w-3.5 mr-1" />}
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleConnect(item)} disabled={isWorking}>
                        {isWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : item.requiresOAuth ? <ExternalLink className="h-3.5 w-3.5 mr-1" /> : <Zap className="h-3.5 w-3.5 mr-1" />}
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function LanguagesSection() {
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(["en", "hi"]);

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Supported Languages</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Enable languages for customer communication and AI responses.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LANGUAGES.map((lang) => (
            <LanguageCard key={lang.code} lang={lang} enabled={enabledLanguages.includes(lang.code)} onToggle={(enabled: boolean) => setEnabledLanguages(enabled ? [...enabledLanguages, lang.code] : enabledLanguages.filter(l => l !== lang.code))} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Translation Settings</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Default language" asSelect value="en" onChange={() => {}} options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))} />
          <Field label="Auto-detect customer language" asSelect value="true" onChange={() => {}} options={[{value:"true",label:"Enabled"},{value:"false",label:"Disabled"}]} />
          <Field label="Translate AI responses" asSelect value="true" onChange={() => {}} options={[{value:"true",label:"Enabled"},{value:"false",label:"Disabled"}]} />
          <Field label="Fallback language" asSelect value="en" onChange={() => {}} options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))} />
        </div>
      </GlassCard>
    </div>
  );
}

function LanguageCard({ lang, enabled, onToggle }: { lang: any; enabled: boolean; onToggle: (enabled: boolean) => void }) {
  return (
    <label className={cn("flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all", enabled ? "border-brand-400/30 bg-brand-500/5" : "border-white/[0.06] bg-white/[0.02] hover:border-white/10")}>
      <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
      <span className="text-2xl">{lang.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white">{lang.name}</div>
        <div className="text-[11px] text-ink-400">{lang.native}</div>
      </div>
      <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:after:content-['✓'] after:absolute after:flex after:items-center after:justify-center after:text-[10px] after:text-white"></div>
    </label>
  );
}

function NotificationsSection({ notifications, setNotifications }: { notifications: any; setNotifications: any }) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Email Notifications</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Receive email updates for important events.</p>
        <div className="mt-4 space-y-3">
          {Object.entries(notifications.email as Record<string, boolean>).map(([key, value]) => (
            <ToggleRow key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} checked={value} onChange={(v: boolean) => setNotifications({ ...notifications, email: { ...notifications.email, [key]: v } })} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Push Notifications</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Mobile and desktop push notifications.</p>
        <div className="mt-4 space-y-3">
          {Object.entries(notifications.push as Record<string, boolean>).map(([key, value]) => (
            <ToggleRow key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} checked={value} onChange={(v: boolean) => setNotifications({ ...notifications, push: { ...notifications.push, [key]: v } })} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">In-App Settings</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">How notifications appear inside Azolik.</p>
        <div className="mt-4 space-y-3">
          {Object.entries(notifications.inApp as Record<string, boolean>).map(([key, value]) => (
            <ToggleRow key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} checked={value} onChange={(v: boolean) => setNotifications({ ...notifications, inApp: { ...notifications.inApp, [key]: v } })} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10">
      <span className="text-[13px] text-white">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
    </label>
  );
}

function AppearanceSection({ appearance, setAppearance }: { appearance: any; setAppearance: any }) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Theme</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Choose your preferred color scheme.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { id: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
            { id: "light", label: "Light", icon: Sun, desc: "Clean and bright" },
            { id: "auto", label: "System", icon: MonitorIcon, desc: "Matches OS setting" },
          ].map((t) => (
            <ThemeOption key={t.id} theme={t} selected={appearance.theme === t.id} onSelect={() => setAppearance({ ...appearance, theme: t.id })} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Density</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Adjust spacing and size of UI elements.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { id: "compact", label: "Compact", desc: "More content on screen" },
            { id: "comfortable", label: "Comfortable", desc: "Balanced spacing" },
            { id: "spacious", label: "Spacious", desc: "Room to breathe" },
          ].map((d) => (
            <DensityOption key={d.id} option={d} selected={appearance.density === d.id} onSelect={() => setAppearance({ ...appearance, density: d.id })} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Behavior</h3>
        <div className="mt-4 space-y-3">
          <BehaviorToggle label="Animations" desc="Smooth transitions and micro-interactions" checked={appearance.animations} onChange={(v: boolean) => setAppearance({ ...appearance, animations: v })} />
          <BehaviorToggle label="Reduced motion" desc="Disable parallax, particles, and complex animations" checked={appearance.reducedMotion} onChange={(v: boolean) => setAppearance({ ...appearance, reducedMotion: v })} />
          <BehaviorToggle label="Compact sidebar" desc="Collapse sidebar to icons only" checked={appearance.compactSidebar} onChange={(v: boolean) => setAppearance({ ...appearance, compactSidebar: v })} />
        </div>
      </GlassCard>
    </div>
  );
}

function ThemeOption({ theme, selected, onSelect }: { theme: any; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn("relative rounded-xl border p-4 text-left transition-all", selected ? "border-brand-400/30 bg-brand-500/10 ring-2 ring-brand-500/20" : "border-white/10 bg-ink-900/40 hover:border-white/20")}
    >
      <div className="flex items-center gap-3">
        <theme.icon className="h-5 w-5 text-brand-300" />
        <div>
          <div className="font-medium text-white">{theme.label}</div>
          <div className="text-[11px] text-ink-400">{theme.desc}</div>
        </div>
      </div>
      {selected && <Check className="absolute bottom-2 right-2 h-4 w-4 text-brand-300" />}
    </button>
  );
}

function DensityOption({ option, selected, onSelect }: { option: any; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn("rounded-xl border p-4 text-left transition-all", selected ? "border-brand-400/30 bg-brand-500/10 ring-2 ring-brand-500/20" : "border-white/10 bg-ink-900/40 hover:border-white/20")}
    >
      <div className="font-medium text-white">{option.label}</div>
      <div className="mt-1 text-[11px] text-ink-400">{option.desc}</div>
      {selected && <Check className="absolute bottom-2 right-2 h-4 w-4 text-brand-300" />}
    </button>
  );
}

function BehaviorToggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-[11px] text-ink-400">{desc}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
    </label>
  );
}

function BillingSection({ billing }: { billing: any }) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Current Plan</h3>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-white/10">
              <CreditCard className="h-6 w-6 text-brand-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-semibold text-white">{billing.plan}</span>
                <Badge tone="emerald" dot>{billing.status}</Badge>
              </div>
              <div className="text-[12px] text-ink-400">₹{billing.pricePerSeat}/seat/month • {billing.seats} seats</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Manage Plan</Button>
            <Button variant="primary">Upgrade</Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Billing Details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoRow label="Next billing date" value={new Date(billing.nextBilling).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
          <InfoRow label="Payment method" value={billing.paymentMethod} />
          <InfoRow label="Seats" value={`${billing.seats} seats`} />
          <InfoRow label="Monthly cost" value={`₹${(billing.seats * billing.pricePerSeat).toLocaleString("en-IN")}`} />
        </div>
        <div className="mt-6 pt-4 border-t border-white/10">
          <Button variant="secondary">Update payment method</Button>
          <Button variant="ghost" className="ml-2">View invoices</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function SecuritySection({ security }: { security: any }) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Two-Factor Authentication</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Add an extra layer of security to your account.</p>
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div>
            <div className="font-medium text-white">Authenticator App</div>
            <div className="text-[12px] text-ink-400">Enabled • Last used 2 hours ago</div>
          </div>
          <Badge tone="emerald" dot>Active</Badge>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary">Regenerate backup codes</Button>
          <Button variant="ghost">Disable 2FA</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Active Sessions</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">Manage devices logged into your account.</p>
        <div className="mt-4 divide-y divide-white/5">
          {security.sessions.map((s: { device: string; location: string; current: boolean; lastActive: string }, i: number) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                  <MonitorIcon className="h-4.5 w-4.5 text-ink-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{s.device}</div>
                  <div className="text-[11.5px] text-ink-400">{s.location} • {s.lastActive}</div>
                </div>
                {s.current && <Badge tone="brand" size="xs">Current</Badge>}
              </div>
              {!s.current && <Button size="xs" variant="ghost" className="text-rose-300 hover:text-rose-100">Revoke</Button>}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="secondary">Revoke all other sessions</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Password</h3>
        <div className="mt-4">
          <Button variant="secondary">Change password</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function APIKeysSection({ apiKeys, setApiKeys }: { apiKeys: any[]; setApiKeys: any }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-white">API Keys</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-400">Manage developer keys for integrations and automations.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Create Key</Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20">
                  <KeyIcon className="h-4.5 w-4.5 text-brand-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{key.name}</span>
                    <Badge tone="emerald" size="xs" dot>Active</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-ink-400">
                    <span>Created {key.created}</span>
                    <span>Last used {key.lastUsed}</span>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03]">
                      <KeyIcon className="h-2.5 w-2.5" /> {key.scopes.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex items-center gap-2 rounded-lg bg-ink-900/50 px-3 py-2 text-[12px] font-mono text-ink-300">
                  {key.key}
                </code>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-rose-300 hover:text-rose-100"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-ink-950 border border-white/10 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)]"
          >
            <h3 className="text-[16px] font-semibold text-white mb-4">Create New API Key</h3>
            <div className="space-y-4">
              <Field label="Key name" value={newKeyName} onChange={(v: string) => setNewKeyName(v)} placeholder="e.g., Production API" />
              <div className="grid gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:after:content-['✓'] after:absolute after:flex after:items-center after:justify-center after:text-[10px] after:text-white"></div>
                  <span className="text-[13px] text-white">Read access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:after:content-['✓'] after:absolute after:flex after:items-center after:justify-center after:text-[10px] after:text-white"></div>
                  <span className="text-[13px] text-white">Write access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:after:content-['✓'] after:absolute after:flex after:items-center after:justify-center after:text-[10px] after:text-white"></div>
                  <span className="text-[13px] text-white">Webhooks</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowCreate(false); setNewKeyName(""); }}>Cancel</Button>
              <Button variant="primary" onClick={() => { setShowCreate(false); setNewKeyName(""); }}>Create Key</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline, rows = 3, fullWidth, asSelect, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean; rows?: number; fullWidth?: boolean; asSelect?: boolean; options?: { value: string; label: string }[]; placeholder?: string }) {
  const id = React.useId();
  if (asSelect) {
    return (
      <label className={cn("block", fullWidth && "md:col-span-2")}>
        <span className="text-[11.5px] font-medium uppercase tracking-wider text-ink-400">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  }
  if (multiline) {
    return (
      <label className={cn("block", fullWidth && "md:col-span-2")}>
        <span className="text-[11.5px] font-medium uppercase tracking-wider text-ink-400">{label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
        />
      </label>
    );
  }
  return (
    <label className={cn("block", fullWidth && "md:col-span-2")}>
      <span className="text-[11.5px] font-medium uppercase tracking-wider text-ink-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-400">{label}</div>
      <div className="mt-1 text-[14px] font-medium text-white">{value}</div>
    </div>
  );
}

function Copy({ className }: { className?: string }) {
  return (
    <CopyIcon className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></CopyIcon>
  );
}

function Key({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
  );
}

function Menu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
  );
}

function Monitor({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  );
}