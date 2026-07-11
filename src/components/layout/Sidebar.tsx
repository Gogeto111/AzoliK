import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Workflow,
  Blocks,
  BarChart3,
  Store,
  Settings as SettingsIcon,
  Sparkles,
  MessageSquare,
  Bot,
  BookOpen,
  Activity,
  Brain,
  Search,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/IconButton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAI } from "@/lib/aiStore";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: { label: string; tone: "brand" | "emerald" | "muted" | "amber"; dot?: boolean };
  comingSoon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/inbox", label: "Inbox", icon: MessageSquare, badge: { label: "New", tone: "emerald", dot: true } },
  { to: "/automation", label: "Automation", icon: Workflow, badge: { label: "Live", tone: "emerald", dot: true } },
  { to: "/integrations", label: "Integrations", icon: Blocks },
  { to: "/knowledge", label: "Knowledge", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/workforce", label: "AI Workforce", icon: Bot, badge: { label: "Live", tone: "brand", dot: true } },
  { to: "/activity", label: "Activity Feed", icon: Activity },
  { to: "/marketplace", label: "Marketplace", icon: Store, badge: { label: "Soon", tone: "muted" }, comingSoon: true },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const ai = useAI();
  return (
    <aside
      className={cn(
        "relative z-30 flex h-full w-[248px] shrink-0 flex-col px-3 py-4",
        className
      )}
    >
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.12 }}
        className="flex items-center gap-3 px-2 pb-4"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8faeff] via-brand-500 to-brand-700 shadow-[0_8px_24px_-6px_rgba(59,91,255,0.6),inset_0_1px_0_rgba(255,255,255,0.3)]">
          <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
          {!prefersReduced && (
            <span className="pointer-events-none absolute -inset-1 rounded-xl">
              <span className="absolute inset-0 rounded-xl bg-brand-500/20 blur-md" />
            </span>
          )}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[14.5px] font-semibold tracking-[-0.02em] text-white">
            Azolik
          </span>
          <span className="text-[10px] font-medium italic text-ink-400">
            Most AIs work with you.
          </span>
          <span className="text-[10px] font-medium text-brand-300 -mt-0.5">
            Azolik works for you.
          </span>
        </div>
      </motion.div>

      {/* Workspace Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.18 }}
        className="px-1 pb-2.5"
      >
        <button className="group glass flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all hover:bg-white/[0.04]">
          <Avatar name="Northwind" tone="violet" size="sm" />
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-medium text-white">
              Northwind Labs
            </span>
            <span className="text-[10.5px] text-ink-400">Pro · 4 seats</span>
          </div>
          <ChevronSelector className="h-3.5 w-3.5 text-ink-500 transition-transform group-hover:translate-y-0.5" />
        </button>
      </motion.div>

      {/* AI search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.24 }}
        className="px-1 pb-3"
      >
        <button
          onClick={() => ai.dispatch({ type: "TOGGLE_COMMAND" })}
          className="group flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          <span className="flex-1 text-[12.5px] text-ink-300 group-hover:text-ink-200">
            Ask Azolik or search…
          </span>
          <span className="hidden items-center gap-0.5 text-[10px] text-ink-500 sm:flex">
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">⌘K</kbd>
          </span>
        </button>
      </motion.div>

      {/* Nav */}
      <nav className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-1 pr-0.5">
        <div className="mb-1 px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
          Workspace
        </div>
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.3 + i * 0.03 }}
            >
              <NavLink
                to={item.comingSoon ? "#" : item.to}
                onClick={(e) => {
                  if (item.comingSoon) e.preventDefault();
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all",
                  isActive
                    ? "text-white"
                    : "text-ink-300 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={prefersReduced ? undefined : "nav-active"}
                    className="absolute inset-0 -z-10 rounded-lg"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId={prefersReduced ? undefined : "nav-edge"}
                    className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-300 to-brand-500 shadow-[0_0_8px_rgba(143,174,255,0.9)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-[17px] w-[17px] transition-all duration-200 group-hover:scale-[1.08]",
                    isActive ? "text-brand-300" : "text-ink-400 group-hover:text-ink-200"
                  )}
                  strokeWidth={1.8}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge tone={item.badge.tone} dot={item.badge.dot} className="!text-[9.5px] !px-1.5 !py-0 !h-[16px]">
                    {item.badge.label}
                  </Badge>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Collab / presence */}
      <div className="mt-2 px-3 pb-2">
        <div className="flex items-center gap-2 text-[10.5px] font-medium text-ink-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
          </span>
          3 teammates active
        </div>
        <div className="mt-2 flex -space-x-2">
          <Avatar name="Alex" tone="brand" size="xs" status="online" />
          <Avatar name="Priya" tone="violet" size="xs" status="online" />
          <Avatar name="Marcus" tone="emerald" size="xs" status="idle" />
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-[9.5px] font-medium text-ink-300 ring-2 ring-ink-950">
            +8
          </div>
        </div>
      </div>

      {/* User */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.6 }}
        className="mt-1 px-1"
      >
        <button className="group flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.04]">
          <Avatar name="Alex Morgan" tone="brand" size="sm" status="online" />
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-medium text-white">
              Alex Morgan
            </span>
            <span className="truncate text-[10.5px] text-ink-400">
              alex@northwind.com
            </span>
          </div>
          <IconButton variant="ghost" size="sm" title="Account">
            <DotsVertical className="h-3.5 w-3.5" />
          </IconButton>
        </button>
      </motion.div>
    </aside>
  );
}

function ChevronSelector({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}
function DotsVertical({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}