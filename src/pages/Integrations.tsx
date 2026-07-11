import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Mail, Table, CalendarDays, ShoppingBag, ShoppingCart,
  CreditCard, FileText, Target, Grid3X3, Briefcase,
  CheckCircle2, Settings2, Activity, RefreshCw, Clock, Link2,
  Plus, Search, Wifi, WifiOff, AlertTriangle, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEngine } from "@/lib/engine";

type Integration = {
  id: string;
  name: string;
  category: string;
  color: string;
  letter: string;
  connected: boolean;
  account?: string;
  health: "healthy" | "degraded" | "error" | "disconnected";
  lastSync: string;
  permissions: string[];
  recent: string[];
  description: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business", category: "Communication", color: "#25D366", letter: "W", connected: true, account: "+91 98***4321", health: "healthy", lastSync: "2s ago", permissions: ["Send", "Read", "Reply"], recent: ["Inbound msg from Priya", "Sent order confirm"], description: "Send & receive WhatsApp messages with customers" },
  { id: "gmail", name: "Gmail", category: "Communication", color: "#EA4335", letter: "M", connected: true, account: "alex@northwind.com", health: "healthy", lastSync: "4s ago", permissions: ["Send", "Read", "Labels"], recent: ["Sent follow-up to Marcus", "Invoice from vendor received"], description: "Send and read emails across accounts" },
  { id: "slack", name: "Slack", category: "Communication", color: "#E01E5A", letter: "S", connected: true, account: "northwind.slack.com", health: "healthy", lastSync: "just now", permissions: ["Post", "Read channels"], recent: ["Alerted team to VIP ticket", "Posted Q3 campaign draft"], description: "Team notifications & alerts" },
  { id: "sheets", name: "Google Sheets", category: "Productivity", color: "#34A853", letter: "X", connected: true, account: "Finance Tracker", health: "healthy", lastSync: "1m ago", permissions: ["Read", "Write"], recent: ["Logged expense ₹499", "Pushed revenue data"], description: "Read and write spreadsheets" },
  { id: "calendar", name: "Google Calendar", category: "Productivity", color: "#4285F4", letter: "C", connected: true, account: "alex@northwind.com", health: "healthy", lastSync: "3m ago", permissions: ["Read", "Create events"], recent: ["Booked Acme Corp demo", "Scheduled candidate interview"], description: "Schedule and manage meetings" },
  { id: "notion", name: "Notion", category: "Productivity", color: "#ffffff", letter: "N", connected: true, account: "northwind.notion.site", health: "healthy", lastSync: "12m ago", permissions: ["Read", "Write pages"], recent: ["Added new hire onboarding doc", "Saved campaign brief"], description: "Docs & knowledge base" },
  { id: "shopify", name: "Shopify", category: "E-commerce", color: "#96BF48", letter: "S", connected: true, account: "northwind.myshopify.com", health: "healthy", lastSync: "30s ago", permissions: ["Products", "Orders"], recent: ["Synced 42 new orders", "Updated inventory"], description: "Products, orders & customers" },
  { id: "woo", name: "WooCommerce", category: "E-commerce", color: "#7F54B3", letter: "W", connected: false, health: "disconnected", lastSync: "—", permissions: [], recent: [], description: "WordPress e-commerce store" },
  { id: "razorpay", name: "Razorpay", category: "Payments", color: "#0F2683", letter: "R", connected: true, account: "rzp_live_***", health: "healthy", lastSync: "15s ago", permissions: ["Payments", "Payouts", "Links"], recent: ["Created payment link ₹2,499", "Payout settled ₹14,210"], description: "Indian payment gateway" },
  { id: "stripe", name: "Stripe", category: "Payments", color: "#635BFF", letter: "S", connected: true, account: "acct_***", health: "degraded", lastSync: "8m ago", permissions: ["Subscriptions", "Charges"], recent: ["Subscription renewed", "Webhook delayed"], description: "Global subscriptions & payments" },
  { id: "hubspot", name: "HubSpot", category: "CRM", color: "#FF7A59", letter: "H", connected: true, account: "northwind.hubspot.com", health: "healthy", lastSync: "2m ago", permissions: ["Leads", "Deals", "Contacts"], recent: ["New lead Atlas Corp", "Deal moved to closed-won"], description: "Inbound marketing & CRM" },
  { id: "zoho", name: "Zoho CRM", category: "CRM", color: "#E42528", letter: "Z", connected: false, health: "disconnected", lastSync: "—", permissions: [], recent: [], description: "Sales & customer management" },
  { id: "outlook", name: "Microsoft Outlook", category: "Communication", color: "#0078D4", letter: "O", connected: false, health: "disconnected", lastSync: "—", permissions: [], recent: [], description: "Microsoft email & calendar" },
  { id: "discord", name: "Discord", category: "Communication", color: "#5865F2", letter: "D", connected: false, health: "disconnected", lastSync: "—", permissions: [], recent: [], description: "Community & server alerts" },
];

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "communication", name: "Communication" },
  { id: "productivity", name: "Productivity" },
  { id: "ecommerce", name: "E-commerce" },
  { id: "payments", name: "Payments" },
  { id: "crm", name: "CRM" },
];

const healthMap = {
  healthy: { label: "Healthy", tone: "emerald" as const, icon: Wifi },
  degraded: { label: "Degraded", tone: "amber" as const, icon: AlertTriangle },
  error: { label: "Error", tone: "rose" as const, icon: AlertTriangle },
  disconnected: { label: "Not connected", tone: "muted" as const, icon: WifiOff },
};

export default function Integrations() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const engine = useEngine();

  const callCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    engine.toolCalls.forEach((c) => { counts[c.tool] = (counts[c.tool] ?? 0) + 1; });
    return counts;
  }, [engine.toolCalls.length]);

  const filtered = INTEGRATIONS.filter((i) => {
    if (cat !== "all" && i.category.toLowerCase() !== cat) return false;
    if (q && !i.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const connected = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect Azolik to every tool your business already runs on. Permissions, sync health, and recent activity for every connector."
        badge={{ label: `${connected} of ${INTEGRATIONS.length} connected`, tone: "emerald", dot: true, pulse: true }}
        actions={
          <Button size="md" variant="primary">
            <Plus className="h-4 w-4" /> Browse Marketplace
          </Button>
        }
      />

      {/* Search + Categories */}
      <GlassCard noPadding className="mb-5">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 focus-within:border-brand-400/30 focus-within:ring-2 focus-within:ring-brand-500/20">
            <Search className="h-4 w-4 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search integrations…"
              className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-ink-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
                  cat === c.id
                    ? "bg-white/[0.08] text-white"
                    : "text-ink-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((i, idx) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.03, type: "spring", stiffness: 260, damping: 26 }}
          >
            <GlassCard interactive className="p-5">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    style={{ background: `linear-gradient(135deg, ${i.color}, ${shade(i.color, -30)})`, color: isLight(i.color) ? "#0b0d14" : "white" }}
                  >
                    {i.letter}
                  </div>
                  {i.connected && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 ring-2 ring-ink-900">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                    </span>
                  )}
                </div>
                {i.connected && (
                  <Badge tone={healthMap[i.health].tone}>
                    {i.health === "healthy" && <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />}
                    {healthMap[i.health].label}
                  </Badge>
                )}
              </div>

              <div className="mt-4">
                <div className="text-[14.5px] font-semibold tracking-[-0.01em] text-white">{i.name}</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wider text-ink-500">{i.category}</div>
                <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-400">{i.description}</p>
              </div>

              {i.connected ? (
                <>
                  <div className="mt-4 space-y-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2 text-[11px] text-ink-400">
                      <Link2 className="h-3 w-3" />
                      <span className="truncate">{i.account}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-400">
                      <Clock className="h-3 w-3" />
                      <span>Last sync {i.lastSync}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-400">
                      <Activity className="h-3 w-3" />
                      <span className="truncate">{i.permissions.length} permissions</span>
                    </div>
                    {callCounts[i.id] && (
                      <div className="flex items-center gap-2 text-[11px] text-ink-400">
                        <ExternalLink className="h-3 w-3" />
                        <span>{callCounts[i.id]} calls today</span>
                      </div>
                    )}
                  </div>

                  {i.recent.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Recent sync</div>
                      {i.recent.slice(0, 2).map((r, ri) => (
                        <div key={ri} className="flex items-start gap-1.5 text-[11.5px] text-ink-300">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                          <span className="truncate">{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="flex-1 gap-1">
                      <Settings2 className="h-3 w-3" /> Manage
                    </Button>
                  </div>
                </>
              ) : (
                <Button size="sm" variant="primary" className="mt-4 w-full gap-1">
                  <Plus className="h-3 w-3" /> Connect
                </Button>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="py-12 text-center" tilt={false}>
          <Search className="h-12 w-12 text-ink-500 mx-auto mb-3" />
          <h3 className="text-[16px] font-medium text-white">No integrations found</h3>
          <p className="mt-1 text-ink-400">Try adjusting your search or filter.</p>
        </GlassCard>
      )}
    </div>
  );
}

function shade(hex: string, percent: number) {
  const c = hex.replace("#", "");
  const n = parseInt(c, 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  r = Math.max(0, Math.min(255, r + Math.round((255 * percent) / 100)));
  g = Math.max(0, Math.min(255, g + Math.round((255 * percent) / 100)));
  b = Math.max(0, Math.min(255, b + Math.round((255 * percent) / 100)));
  return `rgb(${r}, ${g}, ${b})`;
}
function isLight(hex: string) {
  const c = hex.replace("#", "");
  const n = parseInt(c, 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 160;
}