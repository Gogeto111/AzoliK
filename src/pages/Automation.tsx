import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useEngine, workforceEngine, DEPARTMENTS } from "@/lib/engine";
import {
  Workflow,
  Plus,
  Zap,
  GitBranch,
  Clock,
  ArrowUpRight,
  Play,
  Bot,
  CakeSlice,
  CalendarDays,
  Dumbbell,
  Trash2,
  Settings,
  Copy,
  Share2,
  ChevronDown,
  Zap as ZapIcon,
  ArrowRight,
  Circle,
  Square,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const WORKFLOW_TEMPLATES = [
  {
    id: "order",
    title: "Customer Order Flow",
    desc: "\"Do you have chocolate cake?\" → Check stock → Reserve → Payment link → Confirm → Notify kitchen",
    icon: CakeSlice,
    category: "Bakery / Retail",
    steps: [
      { id: "1", name: "New Message", dept: "support", type: "trigger", tool: "whatsapp" },
      { id: "2", name: "Check FAQs", dept: "support", type: "tool", tool: "faqs" },
      { id: "3", name: "Verify Inventory", dept: "support", type: "tool", tool: "inventory" },
      { id: "4", name: "Handoff to Sales", dept: "support", type: "handoff", to: "sales" },
      { id: "5", name: "Log in CRM", dept: "sales", type: "tool", tool: "crm" },
      { id: "6", name: "Generate Payment Link", dept: "sales", type: "tool", tool: "payments" },
      { id: "7", name: "Handoff to Operations", dept: "sales", type: "handoff", to: "operations" },
      { id: "8", name: "Reserve Stock", dept: "operations", type: "tool", tool: "inventory" },
      { id: "9", name: "Create Order", dept: "operations", type: "tool", tool: "orders" },
      { id: "10", name: "Handoff to Finance", dept: "operations", type: "handoff", to: "finance" },
      { id: "11", name: "Log Revenue", dept: "finance", type: "tool", tool: "sheets" },
      { id: "12", name: "Send Confirmation", dept: "support", type: "tool", tool: "whatsapp" },
    ],
  },
  {
    id: "appointment",
    title: "Appointment Booking",
    desc: "\"Are you free tomorrow?\" → Check calendar → Offer slots → Deposit → Invoice → Reminder",
    icon: CalendarDays,
    category: "Clinic / Services",
    steps: [
      { id: "1", name: "Booking Request", dept: "support", type: "trigger", tool: "whatsapp" },
      { id: "2", name: "Check Availability", dept: "support", type: "tool", tool: "calendar" },
      { id: "3", name: "Handoff to Sales", dept: "support", type: "handoff", to: "sales" },
      { id: "4", name: "Propose Slots", dept: "sales", type: "tool", tool: "calendar" },
      { id: "5", name: "Generate Deposit Link", dept: "sales", type: "tool", tool: "payments" },
      { id: "6", name: "Handoff to Finance", dept: "sales", type: "handoff", to: "finance" },
      { id: "7", name: "Create GST Invoice", dept: "finance", type: "tool", tool: "invoices" },
      { id: "8", name: "Handoff to Marketing", dept: "finance", type: "handoff", to: "marketing" },
      { id: "9", name: "Schedule Reminder", dept: "marketing", type: "tool", tool: "calendar" },
      { id: "10", name: "Confirm to Customer", dept: "support", type: "tool", tool: "whatsapp" },
    ],
  },
  {
    id: "lead",
    title: "Lead to Sale",
    desc: "\"Fees kitni hai?\" → Send pricing → Book trial → CRM log → Welcome sequence",
    icon: Dumbbell,
    category: "Gym / Courses",
    steps: [
      { id: "1", name: "Price Inquiry", dept: "support", type: "trigger", tool: "whatsapp" },
      { id: "2", name: "Pull Pricing", dept: "support", type: "tool", tool: "faqs" },
      { id: "3", name: "Reply with Plans", dept: "support", type: "tool", tool: "whatsapp" },
      { id: "4", name: "Handoff to Sales", dept: "support", type: "handoff", to: "sales" },
      { id: "5", name: "Create Lead in CRM", dept: "sales", type: "tool", tool: "crm" },
      { id: "6", name: "Book Trial Slot", dept: "sales", type: "tool", tool: "calendar_book" },
      { id: "7", name: "Generate Trial Payment", dept: "sales", type: "tool", tool: "payments" },
      { id: "8", name: "Handoff to Marketing", dept: "sales", type: "handoff", to: "marketing" },
      { id: "9", name: "Queue Welcome Msg", dept: "marketing", type: "tool", tool: "social" },
      { id: "10", name: "Send Confirmation", dept: "support", type: "tool", tool: "whatsapp" },
    ],
  },
];

const DEPT_COLORS: Record<string, string> = {
  support: "#22d3ee",
  sales: "#34d399",
  marketing: "#a78bfa",
  operations: "#fbbf24",
  finance: "#fb7185",
  hr: "#8faeff",
};

const DEPT_LABELS: Record<string, string> = {
  support: "Support",
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
  finance: "Finance",
  hr: "HR",
};

const TOOL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  faqs: "FAQs",
  inventory: "Inventory",
  crm: "CRM",
  payments: "Payments",
  calendar: "Calendar",
  orders: "Orders",
  sheets: "Sheets",
  invoices: "Invoices",
  calendar_book: "Book Appt",
  social: "Social Media",
};

export default function Automation() {
  const state = useEngine();
  const [activeTab, setActiveTab] = React.useState<"templates" | "builder" | "runs">("templates");
  const [selectedTemplate, setSelectedTemplate] = React.useState<typeof WORKFLOW_TEMPLATES[0] | null>(null);
  const [customWorkflows, setCustomWorkflows] = React.useState<Array<{id: string; name: string; steps: any[]; createdAt: number}>>([]);
  const [, force] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const id = window.setInterval(force, 2000);
    return () => window.clearInterval(id);
  }, []);

  const activeRuns = state.activeTasks.filter((t) => t.status === "running" || t.status === "waiting_handoff");
  const completedToday = state.metrics.automationsCompleted;

  const runTemplate = (template: typeof WORKFLOW_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setActiveTab("builder");
    if (template.id === "order") workforceEngine.runOrderFlow();
    else if (template.id === "appointment") workforceEngine.runAppointmentFlow();
    else if (template.id === "lead") workforceEngine.runLeadFlow();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Visual workflows that run your business. Triggers, handoffs, and tool calls — all visible, no black boxes."
        badge={{ label: `${activeRuns.length} running`, tone: activeRuns.length ? "emerald" : "muted", dot: !!activeRuns.length }}
        actions={
          <div className="flex items-center gap-2">
            <Button size="md" variant="glass">Templates</Button>
            <Button size="md" variant="primary">
              <Plus className="h-4 w-4" /> New Workflow
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile icon={Zap} label="Active workflows" value={String(activeRuns.length)} delta={`${completedToday} completed today`} tone="brand" />
        <StatTile icon={GitBranch} label="Departments online" value={`${DEPARTMENTS.filter(d => d.status === "active").length}/6`} delta="Cross-team routing active" tone="violet" />
        <StatTile icon={Clock} label="Time saved this month" value={`${Math.round(state.metrics.hoursSaved)}h`} delta="~12h / day" tone="emerald" />
      </div>

      {/* Tab Navigation */}
      <GlassCard tone="subtle" className="p-1" tilt={false}>
        <div className="flex gap-1" role="tablist">
          {[
            { id: "templates", label: "Templates", icon: ZapIcon, count: WORKFLOW_TEMPLATES.length },
            { id: "builder", label: "Visual Builder", icon: GitBranch, count: customWorkflows.length },
            { id: "runs", label: "Live Runs", icon: Bot, count: activeRuns.length },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white/[0.06] text-white"
                  : "text-ink-300 hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-ink-300">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Template Gallery */}
      {activeTab === "templates" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {WORKFLOW_TEMPLATES.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 26 }}
              >
                <TemplateCard template={template} onRun={() => runTemplate(template)} />
              </motion.div>
            ))}

            {/* Custom Workflows */}
            {customWorkflows.map((wf, i) => (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 26 }}
              >
                <CustomWorkflowCard workflow={wf} onRun={() => {}} onEdit={() => setActiveTab("builder")} />
              </motion.div>
            ))}

            {/* Create New Card */}
            <button
              onClick={() => setActiveTab("builder")}
              className="group relative h-[280px] flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-left transition-all hover:border-brand-400/40 hover:bg-brand-500/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-white/10">
                <Plus className="h-6 w-6 text-brand-300" />
              </div>
              <div className="text-center">
                <h4 className="text-[16px] font-semibold text-white">Create Custom Workflow</h4>
                <p className="mt-1 text-[12px] text-ink-400">Build from scratch with drag-and-drop</p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-400 group-hover:text-brand-300 transition-colors absolute bottom-4 right-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Visual Builder */}
      {activeTab === "builder" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-white">
                <Workflow className="h-4 w-4 text-brand-300" />
                {selectedTemplate ? `Editing: ${selectedTemplate.title}` : "Build Custom Workflow"}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-ink-400">
                Drag steps to reorder. Connect departments. Watch it run live.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary">
                <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
              </Button>
              <Button size="sm" variant="primary" onClick={() => {}}>
                <Play className="h-3.5 w-3.5 mr-1" /> Test Run
              </Button>
              <Button size="sm" variant="primary" className="bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/30 text-emerald-300">
                <Zap className="h-3.5 w-3.5 mr-1" /> Save & Activate
              </Button>
            </div>
          </div>

          {/* Workflow Canvas */}
          <GlassCard className="p-6 min-h-[500px]" tilt={false}>
            {selectedTemplate ? (
              <WorkflowCanvas template={selectedTemplate} />
            ) : (
              <CustomWorkflowBuilder workflows={customWorkflows} onSave={(wf) => {
                setCustomWorkflows([...customWorkflows, { ...wf, id: `wf-${Date.now()}`, createdAt: Date.now() }]);
              }} />
            )}
          </GlassCard>

          {/* Live Execution Feed */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-6" tilt={false}>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <ZapIcon className="h-4 w-4 text-brand-300" />
                Live Execution
              </h3>
              <p className="mt-0.5 text-[12.5px] text-ink-400">Watch steps execute in real-time</p>
              <LiveExecutionFeed runs={activeRuns} />
            </GlassCard>

            <GlassCard className="p-6" tilt={false}>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <GitBranch className="h-4 w-4 text-brand-300" />
                Recent Runs
              </h3>
              <p className="mt-0.5 text-[12.5px] text-ink-400">History of completed workflows</p>
              <RecentRunsFeed />
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Live Runs Tab */}
      {activeTab === "runs" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <GlassCard className="p-6" tilt={false}>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
              <Bot className="h-4 w-4 text-brand-300" />
              Active Workflow Runs
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              {activeRuns.length} workflow{activeRuns.length !== 1 ? "s" : ""} currently executing across departments
            </p>
            <div className="mt-6 space-y-3">
              {activeRuns.length === 0 ? (
                <div className="py-12 text-center">
                  <Bot className="h-16 w-16 text-ink-600 mx-auto mb-4" />
                  <h4 className="text-[16px] font-medium text-white">No active runs</h4>
                  <p className="mt-1 text-[13px] text-ink-400">Run a template or trigger a workflow to see it here</p>
                </div>
              ) : (
                activeRuns.map((run) => (
                  <LiveRunCard key={run.id} run={run} />
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, delta, tone }: { icon: any; label: string; value: string; delta: string; tone: "brand" | "violet" | "emerald" }) {
  const toneColor = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
  }[tone];

  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${toneColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[22px] font-semibold text-white">{value}</span>
          <Badge tone={tone === "brand" ? "brand" : tone}>{delta}</Badge>
        </div>
      </div>
    </GlassCard>
  );
}

function TemplateCard({ template, onRun }: { template: typeof WORKFLOW_TEMPLATES[0]; onRun: () => void }) {
  const Icon = template.icon;
  return (
    <GlassCard className="flex flex-col h-full p-5 relative overflow-hidden group" hoverLift={4}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-[200px] w-[200px] rounded-full opacity-15 blur-[60px]" style={{ background: DEPT_COLORS[template.steps[0]?.dept || "support"] }} />
      
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset", template.id === "order" ? "from-amber-500/30 to-amber-700/10 text-amber-200" : template.id === "appointment" ? "from-cyan-500/30 to-cyan-700/10 text-cyan-200" : "from-emerald-500/30 to-emerald-700/10 text-emerald-200")}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone="brand" size="sm">{template.category}</Badge>
      </div>

      <h4 className="mt-4 text-[15px] font-semibold text-white">{template.title}</h4>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-400 line-clamp-2">{template.desc}</p>

      {/* Step preview */}
      <div className="mt-4 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {template.steps.slice(0, 6).map((step, i) => (
            <StepBadge key={step.id} step={step} index={i} />
          ))}
          {template.steps.length > 6 && (
            <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10px] text-ink-400">
              +{template.steps.length - 6} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
        <Button size="sm" variant="primary" className="flex-1 gap-1" onClick={onRun}>
          <Play className="h-3.5 w-3.5" /> Run Workflow
        </Button>
        <Button size="sm" variant="ghost" className="text-[11px]">
          <Settings className="h-3 w-3 mr-1" /> Configure
        </Button>
      </div>
    </GlassCard>
  );
}

function StepBadge({ step, index }: { step: any; index: number }) {
  const deptColor = DEPT_COLORS[step.dept] || "#888";
  const isHandoff = step.type === "handoff";
  
  return (
    <div className="relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium">
      <span className="flex h-1.5 w-1.5 rounded-full" style={{ background: deptColor }} />
      <span className="truncate max-w-[80px] text-white">{step.name}</span>
      {isHandoff && <ArrowRight className="h-2.5 w-2.5 text-ink-400" />}
      {step.tool && !isHandoff && (
        <span className="flex h-1.5 w-1.5 items-center justify-center rounded bg-white/10 text-[8px] text-ink-400">
          {TOOL_LABELS[step.tool]?.charAt(0) || "T"}
        </span>
      )}
    </div>
  );
}

function CustomWorkflowCard({ workflow, onRun, onEdit }: { workflow: any; onRun: () => void; onEdit: () => void }) {
  return (
    <GlassCard className="flex flex-col h-full p-5" tilt={false}>
      <div className="flex items-start justify-between">
        <h4 className="text-[15px] font-semibold text-white">{workflow.name}</h4>
        <Badge tone="violet" size="sm">Custom</Badge>
      </div>
      <p className="mt-1 text-[12px] text-ink-400 line-clamp-1">{workflow.steps.length} steps · {new Date(workflow.createdAt).toLocaleDateString()}</p>
      <div className="mt-auto pt-4 border-t border-white/[0.06] flex gap-2">
        <Button size="sm" variant="primary" className="flex-1" onClick={onRun}>
          <Play className="h-3.5 w-3.5 mr-1" /> Run
        </Button>
        <Button size="sm" variant="ghost" className="text-[11px]" onClick={onEdit}>
          <Settings className="h-3 w-3 mr-1" /> Edit
        </Button>
      </div>
    </GlassCard>
  );
}

function WorkflowCanvas({ template }: { template: typeof WORKFLOW_TEMPLATES[0] }) {
  return (
    <div className="space-y-3">
      {template.steps.map((step, i) => (
        <WorkflowStepCard key={step.id} step={step} index={i} total={template.steps.length} template={template} />
      ))}
    </div>
  );
}

function WorkflowStepCard({ step, index, total, template }: { step: any; index: number; total: number; template: typeof WORKFLOW_TEMPLATES[0] }) {
  const deptColor = DEPT_COLORS[step.dept] || "#888";
  const isHandoff = step.type === "handoff";
  const isTrigger = step.type === "trigger";
  const isTool = step.type === "tool";

  const runningTask = template.steps.find(s => s.id === step.id);
  const executing = Math.random() > 0.7; // Simulate for demo

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-[44px] top-[36px] bottom-0 w-0.5 bg-gradient-to-b from-white/10 to-transparent" />
      )}

      <div className="flex items-start gap-4">
        {/* Step indicator */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-10">
          <div className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-xl ring-2 ring-ink-950",
            isTrigger && "bg-gradient-to-br from-brand-500 to-brand-700",
            isHandoff && "bg-gradient-to-br from-amber-500 to-amber-700",
            isTool && `bg-gradient-to-br from-[${deptColor}] to-[${adjustColor(deptColor, -20)}]`
          )}>
            {isTrigger && <ZapIcon className="h-4.5 w-4.5 text-white" />}
            {isHandoff && <ArrowRight className="h-4.5 w-4.5 text-white" />}
            {isTool && <Square className="h-4.5 w-4.5 text-white" />}
            {executing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-xl border-2 border-white/30 border-t-transparent"
              />
            )}
          </div>
          {index < total - 1 && (
            <div className="absolute left-4 top-10 h-full w-0.5 bg-white/5" />
          )}
        </div>

        {/* Step content */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "rounded-xl border p-4 transition-all",
            executing ? "border-emerald-400/30 bg-emerald-500/5 ring-1 ring-emerald-400/10" : "border-white/10 bg-white/[0.02]"
          )}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                  isTrigger && "bg-brand-500/20 text-brand-300",
                  isHandoff && "bg-amber-500/20 text-amber-300",
                  isTool && "bg-white/10 text-ink-300"
                )}>
                  {isTrigger ? "Trigger" : isHandoff ? "Handoff" : "Action"}
                </span>
                <h5 className="text-[14px] font-medium text-white truncate">{step.name}</h5>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={executing ? "emerald" : "muted"} size="xs" dot={executing}>
                  {executing ? "Running" : "Ready"}
                </Badge>
                <Button variant="ghost" size="xs" className="h-6 w-6 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 text-[12px]">
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03]" style={{ borderColor: deptColor }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: deptColor }} />
                <span className="font-medium text-white">{DEPT_LABELS[step.dept]}</span>
              </span>
              {step.tool && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] text-ink-400">
                  <Square className="h-3 w-3" style={{ color: deptColor }} />
                  {TOOL_LABELS[step.tool] || step.tool}
                </span>
              )}
              {isHandoff && step.to && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300">
                  <ArrowRight className="h-3 w-3" /> → {DEPT_LABELS[step.to]}
                </span>
              )}
            </div>

            {executing && (
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CustomWorkflowBuilder({ workflows, onSave }: { workflows: any[]; onSave: (wf: any) => void }) {
  const [name, setName] = React.useState("");
  const [steps, setSteps] = React.useState<any[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-[12px] font-medium text-ink-400 mb-1">Workflow Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., VIP Customer Onboarding"
            className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-ink-400 mb-1">Category</label>
          <select className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
            <option>Sales & Orders</option>
            <option>Support & Tickets</option>
            <option>Appointments</option>
            <option>Finance & Billing</option>
            <option>Marketing</option>
            <option>Operations</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-medium text-white">Steps ({steps.length})</h4>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="py-12 text-center rounded-xl border-2 border-dashed border-white/10">
          <ZapIcon className="h-12 w-12 text-ink-500 mx-auto mb-3" />
          <p className="text-[14px] text-ink-400">No steps yet. Add your first step to start building.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <BuilderStepRow key={step.id} step={step} index={i} onRemove={() => setSteps(steps.filter((_, j) => j !== i))} />
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
        <Button variant="secondary" onClick={() => {}}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave({ name, steps })} disabled={!name || steps.length === 0}>
          <ZapIcon className="h-3.5 w-3.5 mr-1" /> Save Workflow
        </Button>
      </div>

      {showAdd && (
        <AddStepModal onClose={() => setShowAdd(false)} onAdd={(step) => setSteps([...steps, { ...step, id: `step-${Date.now()}` }])} />
      )}
    </div>
  );
}

function BuilderStepRow({ step, index, onRemove }: { step: any; index: number; onRemove: () => void }) {
  const deptColor = DEPT_COLORS[step.dept] || "#888";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <span className="w-6 text-center text-[12px] font-mono text-ink-500">{index + 1}</span>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: deptColor }}>
        <Square className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white truncate">{step.name}</div>
        <div className="flex items-center gap-2 text-[11px] text-ink-400">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5" style={{ borderColor: deptColor }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: deptColor }} />
            {DEPT_LABELS[step.dept]}
          </span>
          {step.tool && <span className="px-1.5 py-0.5 rounded bg-white/5 text-ink-400">{TOOL_LABELS[step.tool] || step.tool}</span>}
        </div>
      </div>
      <Button variant="ghost" size="xs" onClick={onRemove} className="text-rose-300 hover:text-rose-100">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function AddStepModal({ onClose, onAdd }: { onClose: () => void; onAdd: (step: any) => void }) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"trigger" | "tool" | "handoff">("tool");
  const [dept, setDept] = React.useState("support");
  const [tool, setTool] = React.useState("whatsapp");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-ink-950 border border-white/10 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)]"
      >
        <h3 className="text-[16px] font-semibold text-white mb-4">Add Workflow Step</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-ink-400 mb-1">Step Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Check Inventory"
              className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-medium text-ink-400 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="trigger">Trigger (starts workflow)</option>
                <option value="tool">Action (tool call)</option>
                <option value="handoff">Handoff (to another dept)</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink-400 mb-1">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
                <option value="finance">Finance</option>
                <option value="hr">HR</option>
              </select>
            </div>
          </div>
          {type === "tool" && (
            <div>
              <label className="block text-[12px] font-medium text-ink-400 mb-1">Tool</label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="whatsapp">WhatsApp Business</option>
                <option value="faqs">Search FAQs</option>
                <option value="inventory">Check Inventory</option>
                <option value="crm">Update CRM</option>
                <option value="payments">Generate Payment Link</option>
                <option value="calendar">Google Calendar</option>
                <option value="orders">Manage Orders</option>
                <option value="sheets">Google Sheets</option>
                <option value="invoices">Send Invoices</option>
                <option value="calendar_book">Book Appointment</option>
                <option value="social">Create Social Post</option>
              </select>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onAdd({ name, type, dept, tool }); onClose(); }} disabled={!name}>
            Add Step
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function LiveExecutionFeed({ runs }: { runs: any[] }) {
  if (runs.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bot className="h-12 w-12 text-ink-500 mx-auto mb-3" />
        <p className="text-[13px] text-ink-400">No active executions. Run a workflow to see live steps.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      {runs.slice(0, 5).map((run) => (
        <LiveRunCard key={run.id} run={run} compact />
      ))}
    </div>
  );
}

function LiveRunCard({ run, compact = false }: { run: any; compact?: boolean }) {
  const progress = Math.min(100, Math.max(0, run.progress || 0));
  const currentStep = run.currentStep || "Starting…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-all", compact && "p-2")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20">
            <ZapIcon className="h-3.5 w-3.5 text-brand-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-white truncate">{run.title || "Workflow Run"}</p>
            <p className="text-[10px] text-ink-400 truncate">{run.department} · {formatTimeAgo(run.startedAt)}</p>
          </div>
        </div>
        <Badge tone="emerald" size="xs" dot>Running</Badge>
      </div>
      {!compact && (
        <>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-ink-400">
            <span>{currentStep}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

function RecentRunsFeed() {
  const mockRuns = [
    { id: "1", title: "Customer Order Flow", dept: "Support → Sales → Ops → Finance", status: "completed", time: "5 min ago", duration: "2m 34s" },
    { id: "2", title: "Appointment Booking", dept: "Support → Sales → Finance", status: "completed", time: "12 min ago", duration: "1m 58s" },
    { id: "3", title: "Lead to Sale", dept: "Support → Sales → Marketing", status: "completed", time: "28 min ago", duration: "3m 12s" },
    { id: "4", title: "Customer Order Flow", dept: "Support → Sales → Ops → Finance", status: "failed", time: "1h ago", duration: "45s" },
  ];

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {mockRuns.map((run) => (
        <motion.div
          key={run.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", run.status === "completed" ? "bg-emerald-500/20" : "bg-rose-500/20")}>
              {run.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : (
                <Circle className="h-4 w-4 text-rose-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white truncate">{run.title}</p>
              <p className="text-[10px] text-ink-400 truncate">{run.dept}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-ink-400 flex-shrink-0">
            <span>{run.time}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5">{run.duration}</span>
            <Badge tone={run.status === "completed" ? "emerald" : "rose"} size="xs">
              {run.status}
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}