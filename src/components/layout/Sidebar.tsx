import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Workflow,
  BarChart3,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: { label: string; tone: "brand" | "emerald" | "muted" | "amber"; dot?: boolean };
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/inbox", label: "Inbox", icon: MessageSquare, badge: { label: "Live", tone: "emerald", dot: true } },
  { to: "/automation", label: "Automation", icon: Workflow, badge: { label: "Live", tone: "emerald", dot: true } },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

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
        className="flex items-center gap-3 px-2 pb-6"
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
            AI Departments
          </span>
        </div>
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-1">
        <div className="mb-1 px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
          Navigation
        </div>
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/dashboard"
              ? location.pathname === "/dashboard" || location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.2 + i * 0.04 }}
            >
              <NavLink
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
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

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.5 }}
        className="mt-auto px-3 pt-4 border-t border-white/[0.06]"
      >
        <p className="text-[10px] text-ink-500 text-center">
          Demo Mode — Live Judging
        </p>
      </motion.div>
    </aside>
  );
}
