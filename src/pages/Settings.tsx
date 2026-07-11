import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  CreditCard,
  Lock,
  Bell,
  Palette,
  Key,
  Building2,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Lock },
  { id: "api", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function Settings() {
  const [active, setActive] = useState("profile");
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
            {SECTIONS.map((s) => {
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
                  <Icon
                    className={cn("h-4 w-4", isActive ? "text-brand-300" : "text-ink-400")}
                    strokeWidth={2}
                  />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </GlassCard>

        {/* Content */}
        <div className="space-y-5">
          {active === "profile" && <ProfileSection />}
          {active === "appearance" && <AppearanceSection />}
          {active !== "profile" && active !== "appearance" && (
            <GlassCard className="p-8 text-center">
              <p className="text-[13.5px] text-ink-400">
                The <span className="font-medium text-white">{SECTIONS.find(s=>s.id===active)?.label}</span> panel will be fully wired in Phase 2.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <>
      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Profile</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">
          This information will be shown across your workspace.
        </p>
        <div className="mt-6 flex items-center gap-5">
          <Avatar name="Alex Morgan" tone="brand" size="xl" status="online" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Upload photo</Button>
            <Button size="sm" variant="ghost">Remove</Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="First name" defaultValue="Alex" />
          <Field label="Last name" defaultValue="Morgan" />
          <Field label="Email" defaultValue="alex@northwind.com" />
          <Field label="Role" defaultValue="CEO & Founder" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-[15px] font-semibold text-white">Connected accounts</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-400">
          Sign in faster with your existing accounts.
        </p>
        <div className="mt-4 divide-y divide-white/5">
          {[
            { name: "Google", email: "alex@northwind.com", connected: true },
            { name: "Slack", email: "alex", connected: true },
            { name: "GitHub", email: "", connected: false },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between py-3">
              <div>
                <div className="text-[13.5px] font-medium text-white">{c.name}</div>
                {c.email && <div className="text-[11.5px] text-ink-400">{c.email}</div>}
              </div>
              {c.connected ? (
                <Badge tone="emerald"><Check className="h-3 w-3" />Connected</Badge>
              ) : (
                <Button size="sm" variant="secondary">Connect</Button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-[11.5px] font-medium uppercase tracking-wider text-ink-400">{label}</span>
      <input
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
    </label>
  );
}

function AppearanceSection() {
  return (
    <GlassCard className="p-6">
      <h3 className="text-[15px] font-semibold text-white">Appearance</h3>
      <p className="mt-0.5 text-[12.5px] text-ink-400">
        Customize how Azolik looks on your device.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { id: "dark", label: "Dark", active: true },
          { id: "light", label: "Light" },
          { id: "auto", label: "System" },
        ].map((t) => (
          <button
            key={t.id}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              t.active
                ? "border-brand-400/30 bg-brand-500/10 ring-2 ring-brand-500/20"
                : "border-white/10 bg-ink-900/40 hover:border-white/20"
            )}
          >
            <div className={cn("h-20 rounded-lg", t.id==="dark" ? "bg-ink-900" : t.id==="light" ? "bg-ink-100" : "bg-gradient-to-br from-ink-900 to-ink-100")} />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13px] font-medium text-white">{t.label}</span>
              {t.active && <Check className="h-4 w-4 text-brand-300" />}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[12px] text-ink-400">
        <ChevronRight className="h-3 w-3" /> Dark mode is applied by default across the app.
      </p>
    </GlassCard>
  );
}
