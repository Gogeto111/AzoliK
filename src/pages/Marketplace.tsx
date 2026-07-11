import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Store,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Cake,
  Dumbbell,
  UtensilsCrossed,
  ShoppingBag,
  Palette,
  Briefcase,
  Stethoscope,
  GraduationCap,
  Hammer,
  Scale,
  Search,
  Smile,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { switchIndustry, INDUSTRIES_META } from "@/lib/engine";
import { useNavigate } from "react-router-dom";

type DeptPack = {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  icon: any;
  departments: string[];
  category: "Installed" | "Industry" | "Coming soon";
  tone: "cyan" | "emerald" | "violet" | "amber" | "rose" | "brand";
  description: string;
};

const INDUSTRY_PACKS: DeptPack[] = [
  {
    id: "bakery",
    name: "Bakery",
    tagline: "Cake orders, deliveries, pickups",
    emoji: "🥖",
    icon: Cake,
    departments: ["Support", "Sales", "Operations", "Finance", "Marketing"],
    category: "Industry",
    tone: "amber",
    description: "Handle cake inquiries, custom orders, delivery and inventory for a neighbourhood bakery.",
  },
  {
    id: "dental",
    name: "Dental Clinic",
    tagline: "Appointments, reminders, billing",
    emoji: "🦷",
    icon: Smile,
    departments: ["Support", "Sales", "Operations", "Finance", "Marketing"],
    category: "Industry",
    tone: "cyan",
    description: "Book appointments, send reminders, collect deposits and reconcile payments.",
  },
  {
    id: "gym",
    name: "Gym & Fitness",
    tagline: "Memberships, trials, trainer slots",
    emoji: "💪",
    icon: Dumbbell,
    departments: ["Support", "Sales", "Operations", "Finance", "HR"],
    category: "Industry",
    tone: "emerald",
    description: "Convert fee inquiries into trials, book trainer slots, and chase renewals.",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    tagline: "Reservations, deliveries, reviews",
    emoji: "🍽",
    icon: UtensilsCrossed,
    departments: ["Support", "Sales", "Operations", "Finance", "Marketing"],
    category: "Industry",
    tone: "rose",
    description: "Take reservations, manage delivery orders, reply to reviews, and plan prep.",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    tagline: "Products, orders, returns",
    emoji: "📦",
    icon: ShoppingBag,
    departments: ["Support", "Sales", "Operations", "Finance", "Marketing"],
    category: "Installed",
    tone: "violet",
    description: "Your current Northwind Labs setup — support, CRM, fulfilment, payments.",
  },
  {
    id: "agency",
    name: "Creative Agency",
    tagline: "Leads, proposals, projects",
    emoji: "🎨",
    icon: Palette,
    departments: ["Sales", "Marketing", "Operations", "Finance", "HR"],
    category: "Industry",
    tone: "brand",
    description: "Qualify leads, send proposals, manage retainers and send invoices.",
  },
];

const COMING_SOON: DeptPack[] = [
  { id: "clinic", name: "Medical Clinic", tagline: "Prescriptions, follow-ups", emoji: "🩺", icon: Stethoscope, departments: ["Support", "Operations", "Finance"], category: "Coming soon", tone: "cyan", description: "Patient triage, appointments and prescription refills." },
  { id: "legal", name: "Legal Department", tagline: "Contracts, NDAs, reviews", emoji: "⚖️", icon: Scale, departments: ["Operations", "Finance"], category: "Coming soon", tone: "rose", description: "Draft and review contracts; flag risk automatically." },
  { id: "edu", name: "Coaching / Classes", tagline: "Enrollments, schedules", emoji: "🎓", icon: GraduationCap, departments: ["Support", "Sales", "Operations"], category: "Coming soon", tone: "violet", description: "Admissions, class scheduling, fee collection." },
  { id: "trades", name: "Home Services", tagline: "Quotes, dispatch, invoicing", emoji: "🔧", icon: Hammer, departments: ["Support", "Sales", "Operations"], category: "Coming soon", tone: "amber", description: "Plumbers, electricians, cleaners — quotes → dispatch → invoice." },
  { id: "recruit", name: "Recruitment", tagline: "Sourcing, screening, offers", emoji: "👥", icon: Briefcase, departments: ["HR", "Operations"], category: "Coming soon", tone: "brand", description: "Source candidates, screen resumes and schedule interviews." },
];

const TONE_STYLE = {
  cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200 ring-cyan-400/20",
  emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200 ring-emerald-400/20",
  violet: "from-violet-500/30 to-violet-700/10 text-violet-200 ring-violet-400/20",
  amber: "from-amber-500/30 to-amber-700/10 text-amber-200 ring-amber-400/20",
  rose: "from-rose-500/30 to-rose-700/10 text-rose-200 ring-rose-400/20",
  brand: "from-brand-500/30 to-brand-700/10 text-brand-200 ring-brand-400/20",
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | "industry" | "coming">("all");

  const installed = INDUSTRIES_META;
  const installedId = Object.keys(installed)[0];

  const filter = (p: DeptPack) => {
    if (tab === "industry" && p.category === "Coming soon") return false;
    if (tab === "coming" && p.category !== "Coming soon") return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  };

  const industry = INDUSTRY_PACKS.filter(filter);
  const upcoming = COMING_SOON.filter(filter);

  const install = (id: string) => {
    // Switches the engine state; in production this would be a server-side install
    switchIndustry(id as any);
    navigate("/");
  };

  return (
    <div>
      <PageHeader
        title="Marketplace"
        description="Install entire departments, not software. People don't install apps anymore — they hire teams."
        badge={{ label: "App Store for AI Departments", tone: "brand", dot: true }}
      />

      <GlassCard tone="strong" className="relative overflow-hidden p-8" tilt={false}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute -left-20 bottom-[-120px] h-80 w-80 rounded-full bg-violet-500/20 blur-[110px]" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-300">
            <Store className="h-3 w-3" /> Hiring Store
          </div>
          <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-tight text-white md:text-[36px]">
            Install an entire department
            <br />
            <span className="text-gradient-brand">in one click.</span>
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-300">
            Most AIs work <span className="line-through text-ink-500">with you</span>.
            {" "}<span className="font-medium text-white">Azolik works for you.</span>{" "}
            Pick an industry pack and watch your workforce come online with the
            right policies, tools, and voice on day one.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a department pack…"
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-ink-500 focus:outline-none"
              />
            </div>
            <Button variant="primary" onClick={() => navigate("/departments")}>
              <Sparkles className="h-4 w-4" />
              Hire a department
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11.5px] text-ink-400">
            {(["all", "industry", "coming"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3 py-1 transition-all",
                  tab === t
                    ? "bg-white/10 text-white ring-1 ring-inset ring-white/15"
                    : "hover:text-white"
                )}
              >
                {t === "all" ? "All packs" : t === "industry" ? "Industry" : "Coming soon"}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Store className="h-4 w-4 text-brand-300" />
              Industry Packs
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              Pre-trained departments tuned to a real business type.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industry.map((p, i) => {
            const Ico = p.icon;
            const isInstalled = installedId === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 26 }}
              >
                <GlassCard className="flex h-full flex-col p-5" hoverLift={4}>
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-[18px] ring-1 ring-inset",
                        TONE_STYLE[p.tone]
                      )}
                    >
                      {/* emoji glyph */}
                      <span className="leading-none">{p.emoji}</span>
                    </div>
                    {isInstalled ? (
                      <Badge tone="emerald" dot>
                        <CheckCircle2 className="h-3 w-3" />
                        Installed
                      </Badge>
                    ) : p.category === "Coming soon" ? (
                      <Badge tone="muted">Soon</Badge>
                    ) : (
                      <Badge tone="brand">Ready</Badge>
                    )}
                  </div>

                  <h4 className="mt-4 text-[15px] font-semibold text-white">{p.name}</h4>
                  <p className="text-[12px] text-ink-400">{p.tagline}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-300">
                    {p.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.departments.map((d) => (
                      <span
                        key={d}
                        className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-ink-300"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-5">
                    <Button
                      size="sm"
                      variant={isInstalled ? "glass" : "primary"}
                      className="w-full gap-1"
                      disabled={p.category === "Coming soon"}
                      onClick={() => install(p.id)}
                    >
                      {isInstalled ? (
                        <>
                          Open dashboard
                          <ArrowUpRight className="h-3 w-3" />
                        </>
                      ) : p.category === "Coming soon" ? (
                        "Notify me"
                      ) : (
                        <>
                          Install pack
                          <ArrowUpRight className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {(tab === "all" || tab === "coming") && upcoming.length > 0 && (
        <section className="mt-8">
          <div className="mb-3">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Coming soon
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              New departments and industry packs being trained now.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((p, i) => {
              const Ico = p.icon;
              return (
                <GlassCard key={p.id} className="p-5 opacity-80" tilt={false}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset",
                      TONE_STYLE[p.tone]
                    )}>
                      <span className="text-[18px] leading-none">{p.emoji}</span>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-white">{p.name}</h4>
                      <p className="text-[11.5px] text-ink-400">{p.tagline}</p>
                    </div>
                    <Badge tone="muted" className="ml-auto">Soon</Badge>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-ink-300">{p.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
