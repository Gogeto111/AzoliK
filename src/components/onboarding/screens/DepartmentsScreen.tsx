"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Briefcase, BarChart3, CreditCard, Settings, Users,
  Sparkles, CheckCircle2, ArrowLeft, ArrowRight, Check, Zap,
  Shield, Brain, Zap as ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface DepartmentsScreenProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const DEPARTMENTS = [
  {
    id: "support",
    name: "Support",
    icon: MessageSquare,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    tagline: "Replies instantly to customers",
    features: [
      "WhatsApp, Instagram, Email auto-replies",
      "FAQs answered in seconds",
      "Order tracking & status updates",
      "Returns & refunds handled",
      "Escalates complex issues to you",
    ],
    agents: ["Support Bot", "FAQ Agent", "Order Tracker", "Escalation Manager"],
    rating: 5,
    recommended: true,
  },
  {
    id: "sales",
    name: "Sales",
    icon: Briefcase,
    color: "text-green-400",
    bg: "bg-green-500/20",
    tagline: "Follows up leads automatically",
    features: [
      "Captures leads from all channels",
      "Sends quotes & proposals",
      "Follows up until conversion",
      "Collects payments via links",
      "Updates CRM in real-time",
    ],
    agents: ["Lead Qualifier", "Quote Generator", "Follow-up Agent", "Payment Collector"],
    rating: 5,
    recommended: true,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: BarChart3,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
    tagline: "Creates & schedules content",
    features: [
      "Writes social media posts",
      "Creates email campaigns",
      "Designs graphics with AI",
      "Schedules across platforms",
      "Tracks engagement & ROI",
    ],
    agents: ["Content Writer", "Designer", "Scheduler", "Analytics Agent"],
    rating: 4,
    recommended: true,
  },
  {
    id: "finance",
    name: "Finance",
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    tagline: "Handles invoices & expenses",
    features: [
      "Generates & sends invoices",
      "Tracks payments & overdue",
      "Categorizes expenses",
      "Reconciles bank statements",
      "Prepares tax reports",
    ],
    agents: ["Invoice Agent", "Payment Tracker", "Expense Categorizer", "Reconciler"],
    rating: 5,
    recommended: true,
  },
  {
    id: "operations",
    name: "Operations",
    icon: Settings,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    tagline: "Manages inventory & orders",
    features: [
      "Syncs inventory across channels",
      "Processes orders automatically",
      "Manages vendor relationships",
      "Tracks shipments & delivery",
      "Optimizes stock levels",
    ],
    agents: ["Inventory Sync", "Order Processor", "Vendor Manager", "Logistics Agent"],
    rating: 4,
    recommended: false,
  },
  {
    id: "hr",
    name: "HR",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    tagline: "Manages team & hiring",
    features: [
      "Posts jobs & screens candidates",
      "Onboards new employees",
      "Manages attendance & leaves",
      "Runs payroll calculations",
      "Maintains policy documents",
    ],
    agents: ["Recruiter", "Onboarding Agent", "Payroll Agent", "Policy Keeper"],
    rating: 3,
    recommended: false,
  },
];

export function DepartmentsScreen({ onComplete, onBack }: DepartmentsScreenProps) {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    "support", "sales", "finance"
  ]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const toggleDepartment = (id: string) => {
    setSelectedDepartments(prev => 
      prev.includes(id) 
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedDepartments.includes(id);

  const handleComplete = () => {
    onComplete({ departments: selectedDepartments });
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950"
    >
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-900 border-b border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Azolik</h1>
              <p className="text-xs text-ink-400">Build your AI workforce</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">Step 8 of 10</p>
            <p className="text-xs text-ink-500">80% complete</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Recommended: Support, Sales & Finance
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Which departments{" "}
              <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
                should come online first?
              </span>
            </h1>
            <p className="text-lg text-ink-300">
              Each department comes with specialized AI agents, tools, and workflows. 
              You can add more later.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-ink-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {selectedDepartments.length} selected
              </span>
              <span className="flex items-center gap-1">
                <ZapIcon className="h-4 w-4 text-amber-400" />
                Ready in ~2 min
              </span>
            </div>
          </motion.div>

          <div className="flex-1 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedDepartments.length}
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {DEPARTMENTS.map((dept) => {
                  const selected = isSelected(dept.id);
                  return (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => toggleDepartment(dept.id)}
                      className={cn(
                        "relative cursor-pointer group",
                        selected && "ring-2 ring-brand-500/50"
                      )}
                    >
                      <GlassCard 
                        className={cn(
                          "h-full p-6 transition-all",
                          selected
                            ? "border-brand-500/30 bg-brand-500/5 ring-1 ring-brand-500/20"
                            : "border-white/10 hover:border-brand-500/20 hover:bg-brand-500/5"
                        )}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/10",
                            dept.bg
                          )}>
                            <dept.icon className={cn("h-7 w-7", dept.color)} />
                          </div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                              selected
                                ? "bg-brand-500 text-white"
                                : "bg-white/5 text-ink-400 hover:bg-brand-500/20 hover:text-brand-400"
                            )}
                          >
                            <Check className="h-5 w-5" />
                          </motion.div>
                        </div>

                        {dept.recommended && (
                          <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-3"
                          >
                            <Sparkles className="h-3 w-3" />
                            Recommended
                          </motion.span>
                        )}

                        <h3 className="text-xl font-semibold text-white mb-1">{dept.name}</h3>
                        <p className="text-sm text-ink-300 mb-4">{dept.tagline}</p>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(dept.rating)].map((_, i) => (
                              <span key={i} className="text-2xl">\u2605</span>
                            ))}
                          </div>
                          <span className="text-sm text-ink-400">{dept.rating}/5</span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {dept.features.slice(0, 3).map((feature, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.05 }}
                              className="flex items-center gap-2 text-sm text-ink-300"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                              <span>{feature}</span>
                            </motion.div>
                          ))}
                          {dept.features.length > 3 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-brand-400 hover:text-brand-300 cursor-pointer"
                            >
                              +{dept.features.length - 3} more features
                            </motion.div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-ink-400 mb-2">AI Agents included:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.agents.map((agent) => (
                              <span
                                key={agent}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-ink-300"
                              >
                                {agent}
                              </span>
                            ))}
                          </div>
                        </div>
                      </GlassCard>

                      {selected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Departments Selected</p>
                <p className="text-sm text-ink-400">
                  {selectedDepartments.map(id => DEPARTMENTS.find(d => d.id === id)?.name).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-400">{selectedDepartments.length}</p>
                <p className="text-xs text-ink-400">departments ready</p>
              </div>
            </div>
          </motion.div>
        </main>

        <div className="p-4 sm:p-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={selectedDepartments.length === 0}
              className="gap-2 w-full sm:w-auto"
            >
              <Zap className="h-5 w-5" />
              Activate {selectedDepartments.length} Departments
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DepartmentsScreen;