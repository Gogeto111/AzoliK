/**
 * Azolik Workforce Engine
 *
 * The "employees" simulation. Each department has a current status line,
 * processes incoming customer messages across handoffs, writes results to
 * business memory, and notifies the owner when work completes.
 *
 * This is simulated with realistic timings so the UI is honest about what
 * is happening at every step — no "thinking…" spinners, just concrete work.
 */
import type {
  DepartmentId,
  ToolCall,
  Handoff,
  Task,
  TimelineEvent,
  MemoryEntry,
  ToolId,
} from "@/types";
import { DEPARTMENTS } from "@/data/departments";

export type Industry =
  | "bakery"
  | "dental"
  | "gym"
  | "restaurant"
  | "ecommerce"
  | "agency";

export type IncomingMessage = {
  id: string;
  customer: { name: string; phone?: string; channel: "whatsapp" | "email" | "instagram" | "sms" };
  text: string;
  receivedAt: number;
};

export type AttentionItem = {
  id: string;
  kind: "approval" | "anomaly" | "expiring" | "vip";
  title: string;
  detail: string;
  department: DepartmentId;
  at: number;
  severity: "info" | "warn" | "urgent";
};

export type ResultNotification = {
  id: string;
  icon: "order" | "appointment" | "lead" | "payment" | "reply" | "expense" | "review";
  title: string;
  detail: string;
  department: DepartmentId;
  at: number;
};

export type EngineState = {
  activeTasks: Task[];
  toolCalls: ToolCall[];
  handoffs: Handoff[];
  timeline: TimelineEvent[];
  memory: MemoryEntry[];
  results: ResultNotification[];
  attention: AttentionItem[];
  inbox: IncomingMessage[];
  departmentStatus: Record<
    DepartmentId,
    {
      line: string;      // one-line status ("Checking inventory for chocolate cake")
      tone: "idle" | "working" | "handoff" | "done";
      startedAt: number;
      completedTasksToday: number;
    }
  >;
  industry: Industry;
  businessName: string;
  ownerName: string;
  metrics: {
    revenueGenerated: number;
    leadsClosed: number;
    customersHelped: number;
    appointmentsBooked: number;
    ordersClosed: number;
    hoursSaved: number;
    automationsCompleted: number;
    tasksRunning: number;
    agentsWorking: number;
  };
};

type Listener = (s: EngineState) => void;

const toolNames: Record<string, string> = {
  whatsapp: "WhatsApp Business", gmail: "Gmail", sheets: "Google Sheets",
  calendar: "Google Calendar", shopify: "Shopify", woo: "WooCommerce",
  razorpay: "Razorpay", stripe: "Stripe", notion: "Notion", slack: "Slack",
  discord: "Discord", hubspot: "HubSpot", zoho: "Zoho CRM", outlook: "Outlook",
  faqs: "Knowledge Base", inventory: "Inventory", orders: "Orders",
  payments: "Payment Link", invoices: "GST Invoice", expenses: "Expenses",
  crm: "CRM", social: "Social Post", email_marketing: "Email Campaign",
  calendar_book: "Book Appointment",
};

const deptLabel: Record<DepartmentId, string> = {
  support: "Support", sales: "Sales", marketing: "Marketing",
  operations: "Operations", finance: "Finance", hr: "HR",
};

// --- Industry templates: shape memory, incoming messages, and status lines ---
type IndustryTemplate = {
  businessName: string;
  ownerName: string;
  products: { name: string; price: number; stock: number; unit?: string }[];
  policies: string[];
  customerSeeds: { name: string; note: string }[];
  openingHours: string;
  incoming: Array<() => { customer: string; channel: IncomingMessage["customer"]["channel"]; text: string; flow: string }>;
};

const INDUSTRIES: Record<Industry, IndustryTemplate> = {
  bakery: {
    businessName: "Butter & Crust Bakery",
    ownerName: "Aarish",
    products: [
      { name: "Chocolate Cake (500g)", price: 549, stock: 6 },
      { name: "Sourdough Loaf", price: 280, stock: 18 },
      { name: "Butter Croissant", price: 90, stock: 32 },
      { name: "Blueberry Muffin", price: 75, stock: 24 },
    ],
    policies: [
      "Returns: Same-day for unused items",
      "Free delivery above ₹499 within 5km",
      "Custom cakes need 24h notice",
    ],
    customerSeeds: [
      { name: "Sara Khan · VIP · likes less sugar", note: "prefers WhatsApp" },
      { name: "Rohan Mehta · orders every Saturday", note: "corporate orders" },
    ],
    openingHours: "Tue–Sun, 8 AM – 10 PM",
    incoming: [
      () => ({ customer: "Ananya R.", channel: "whatsapp", text: "Hi! Do you have chocolate cake right now?", flow: "cakeInquiry" }),
      () => ({ customer: "Kabir S.", channel: "instagram", text: "How much for a birthday cake for 10 people?", flow: "customCake" }),
      () => ({ customer: "Priya M.", channel: "whatsapp", text: "Can I order 2 croissants for pickup in 20 min?", flow: "quickOrder" }),
    ],
  },
  dental: {
    businessName: "SmileCraft Dental",
    ownerName: "Dr. Aarish",
    products: [
      { name: "Routine Cleaning", price: 1200, stock: 99 },
      { name: "Cavity Filling (composite)", price: 2500, stock: 99 },
      { name: "Teeth Whitening", price: 6500, stock: 99 },
      { name: "Root Canal", price: 8500, stock: 99 },
    ],
    policies: [
      "Cancellations must be 4h before appointment",
      "20% deposit required to book",
      "Follow-up reminders sent 24h before",
    ],
    customerSeeds: [
      { name: "Meera Joshi · next cleaning due", note: "prefers afternoon" },
      { name: "Arjun Patel · outstanding ₹1,200", note: "insurance pending" },
    ],
    openingHours: "Mon–Sat, 10 AM – 8 PM",
    incoming: [
      () => ({ customer: "Neha T.", channel: "whatsapp", text: "Hi doctor, are you free tomorrow for a checkup?", flow: "appointment" }),
      () => ({ customer: "Vikram R.", channel: "email", text: "Need to reschedule my Friday appointment to next week.", flow: "reschedule" }),
      () => ({ customer: "Isha D.", channel: "whatsapp", text: "I have a terrible toothache. Can I come today?", flow: "urgent" }),
    ],
  },
  gym: {
    businessName: "IronForge Fitness",
    ownerName: "Aarish",
    products: [
      { name: "Monthly Membership", price: 2499, stock: 99 },
      { name: "Quarterly Membership", price: 5999, stock: 99 },
      { name: "Personal Training (10 sessions)", price: 12000, stock: 99 },
      { name: "1-Day Trial", price: 199, stock: 99 },
    ],
    policies: [
      "7-day money back on new memberships",
      "Trainer slots 6 AM – 10 PM",
      "Guest pass allowed once per member",
    ],
    customerSeeds: [
      { name: "Dev Malhotra · referral 3 friends", note: "loves deadlifts" },
      { name: "Kavya S. · renewing next week", note: "interested in PT pack" },
    ],
    openingHours: "Mon–Sun, 5:30 AM – 11 PM",
    incoming: [
      () => ({ customer: "Tanmay K.", channel: "whatsapp", text: "Fees kitni hai? Monthly?", flow: "feesInquiry" }),
      () => ({ customer: "Ritika B.", channel: "instagram", text: "Can I come for a trial tomorrow morning?", flow: "trialBooking" }),
      () => ({ customer: "Aman V.", channel: "sms", text: "Is the personal trainer available this evening?", flow: "trainerInquiry" }),
    ],
  },
  restaurant: {
    businessName: "Tulsi Kitchen",
    ownerName: "Aarish",
    products: [
      { name: "Butter Chicken + Naan", price: 380, stock: 40 },
      { name: "Paneer Tikka Masala", price: 320, stock: 35 },
      { name: "Veg Thali", price: 290, stock: 25 },
      { name: "Mango Lassi", price: 90, stock: 50 },
    ],
    policies: [
      "Delivery in 30–40 min within 4km",
      "Bulk orders (10+) require 2h notice",
      "Table held for 15 minutes only",
    ],
    customerSeeds: [
      { name: "Nikhil · regular · extra spicy", note: "delivery" },
      { name: "Pooja · booked table Friday", note: "anniversary" },
    ],
    openingHours: "Daily, 12 PM – 11 PM",
    incoming: [
      () => ({ customer: "Aarti S.", channel: "whatsapp", text: "Table for 4 tonight at 9, possible?", flow: "reservation" }),
      () => ({ customer: "Mohit K.", channel: "whatsapp", text: "Do you have butter chicken right now? Home delivery to Sector 29.", flow: "deliveryOrder" }),
    ],
  },
  ecommerce: {
    businessName: "Northwind Labs",
    ownerName: "Aarish",
    products: [
      { name: "Wireless Earbuds Pro", price: 2499, stock: 142 },
      { name: "Leather Wallet", price: 1299, stock: 8 },
      { name: "Ceramic Mug Set", price: 649, stock: 64 },
    ],
    policies: ["Returns: 7 days for unused items", "Free shipping above ₹999"],
    customerSeeds: [
      { name: "Priya Sharma · VIP · prefers WhatsApp", note: "repeat buyer" },
      { name: "Marcus Chen · Acme Corp", note: "enterprise" },
    ],
    openingHours: "24/7 online",
    incoming: [
      () => ({ customer: "Riya G.", channel: "whatsapp", text: "Hi, are the Wireless Earbuds Pro in stock?", flow: "productInquiry" }),
      () => ({ customer: "Aarav P.", channel: "email", text: "I need to return my order, how?", flow: "return" }),
    ],
  },
  agency: {
    businessName: "Northwind Studio",
    ownerName: "Aarish",
    products: [
      { name: "Brand Identity Package", price: 85000, stock: 1 },
      { name: "Landing Page Design", price: 45000, stock: 1 },
      { name: "Monthly Retainer (Social)", price: 60000, stock: 3 },
    ],
    policies: ["50% advance, 50% on delivery", "2 rounds of revisions included"],
    customerSeeds: [
      { name: "Elena Rossi · Q3 campaign approved", note: "marketing" },
    ],
    openingHours: "Mon–Fri, 10 AM – 7 PM",
    incoming: [
      () => ({ customer: "Zain Corp", channel: "email", text: "Looking for a landing page redesign. What's the timeline?", flow: "lead" }),
    ],
  },
};

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const STATUS_DEFAULTS: Record<DepartmentId, string[]> = {
  support: ["Answering incoming messages", "Scanning the inbox", "Drafting customer replies"],
  sales: ["Reviewing pipeline", "Following up with warm leads", "Drafting outreach emails"],
  marketing: ["Reviewing campaign calendar", "Drafting tomorrow's posts", "Analyzing engagement"],
  operations: ["Syncing inventory across channels", "Checking open orders", "Updating fulfilment"],
  finance: ["Reconciling last hour's payments", "Categorizing expenses", "Generating invoices"],
  hr: ["Screening new applicants", "Scheduling interviews", "Updating onboarding docs"],
};

class Engine {
  state: EngineState;

  listeners = new Set<Listener>();
  private timer?: number;
  private messageTimer?: number;

  constructor(initialIndustry: Industry = "bakery") {
    this.state = this.bootFor(initialIndustry);
  }

  private bootFor(industry: Industry): EngineState {
    const tpl = INDUSTRIES[industry];
    const memory: MemoryEntry[] = [];
    const now = Date.now();

    tpl.products.forEach((p, i) =>
      memory.push({
        id: makeId(),
        type: "product",
        key: `${p.name} · ₹${p.price} · ${p.stock} in stock`,
        value: JSON.stringify(p),
        source: "operations",
        createdAt: now - 86400000 * (i + 2),
        accessCount: 20 + i * 8,
        confidence: 0.98,
      })
    );
    tpl.policies.forEach((p, i) =>
      memory.push({
        id: makeId(),
        type: "policy",
        key: p,
        value: p,
        source: "operations",
        createdAt: now - 86400000 * 30,
        accessCount: 60 + i * 20,
        confidence: 1,
      })
    );
    memory.push({
      id: makeId(),
      type: "policy",
      key: `Working hours: ${tpl.openingHours}`,
      value: tpl.openingHours,
      source: "hr",
      createdAt: now - 86400000 * 90,
      accessCount: 20,
      confidence: 1,
    });
    tpl.customerSeeds.forEach((c, i) =>
      memory.push({
        id: makeId(),
        type: "customer",
        key: `${c.name} · ${c.note}`,
        value: c.note,
        source: "support",
        createdAt: now - 86400000 * (i + 10),
        accessCount: 10 + i * 5,
        confidence: 0.9,
      })
    );
    memory.push({
      id: makeId(),
      type: "preference",
      key: "Brand voice: warm, concise, no jargon. Reply in the language the customer used.",
      value: "warm, concise, multilingual",
      source: "marketing",
      createdAt: now - 86400000 * 60,
      accessCount: 89,
      confidence: 1,
    });

    const departmentStatus = {} as EngineState["departmentStatus"];
    (Object.keys(deptLabel) as DepartmentId[]).forEach((id) => {
      departmentStatus[id] = {
        line: STATUS_DEFAULTS[id][0],
        tone: "working",
        startedAt: now,
        completedTasksToday: Math.floor(30 + Math.random() * 120),
      };
    });
    // Start Marketing and HR in idle (user's original mock)
    departmentStatus.marketing = {
      ...departmentStatus.marketing,
      line: "Drafting tomorrow's Instagram post",
      tone: "working",
    };
    departmentStatus.hr = { ...departmentStatus.hr, line: "Awaiting new applicants", tone: "idle" };

    return {
      activeTasks: [],
      toolCalls: [],
      handoffs: [],
      timeline: [],
      memory,
      results: [],
      attention: [
        {
          id: makeId(),
          kind: "approval",
          title: "Q3 campaign budget",
          detail: "Marketing is waiting for your approval on ₹45,000 ad spend",
          department: "marketing",
          at: Date.now() - 1000 * 60 * 8,
          severity: "warn",
        },
        {
          id: makeId(),
          kind: "anomaly",
          title: "GST mismatch flagged",
          detail: "2 invoices need your review before Finance reconciles",
          department: "finance",
          at: Date.now() - 1000 * 60 * 22,
          severity: "urgent",
        },
      ],
      inbox: [],
      departmentStatus,
      industry,
      businessName: tpl.businessName,
      ownerName: tpl.ownerName,
      metrics: {
        revenueGenerated: 0,
        leadsClosed: 0,
        customersHelped: 0,
        appointmentsBooked: 0,
        ordersClosed: 0,
        hoursSaved: 0,
        automationsCompleted: 0,
        tasksRunning: 0,
        agentsWorking: 0,
      },
    };
  }

  setIndustry(industry: Industry) {
    this.stop();
    this.state = this.bootFor(industry);
    this.emit();
    this.start();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.state.metrics.tasksRunning = this.state.activeTasks.filter(
      (t) => t.status === "running" || t.status === "waiting_handoff"
    ).length;
    this.state.metrics.agentsWorking = new Set(
      this.state.activeTasks
        .filter((t) => t.status === "running")
        .map((t) => `${t.department}:${t.assignee}`)
    ).size;
    this.listeners.forEach((l) => l(this.state));
  }

  start() {
    if (this.timer) return;
    this.timer = window.setInterval(() => this.tick(), 3500);
    this.messageTimer = window.setInterval(() => this.spawnIncoming(), 14000);

    // Kick off ambient narrative per department
    setTimeout(() => this.rotateStatus("support"), 1200);
    setTimeout(() => this.rotateStatus("sales"), 2200);
    setTimeout(() => this.rotateStatus("finance"), 3100);
    setTimeout(() => this.rotateStatus("operations"), 4000);
    setTimeout(() => this.rotateStatus("marketing"), 5200);

    // Prime with one live customer flow to demonstrate immediately
    setTimeout(() => this.spawnIncoming(true), 2500);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    if (this.messageTimer) window.clearInterval(this.messageTimer);
    this.timer = undefined;
    this.messageTimer = undefined;
  }

  private setDeptStatus(id: DepartmentId, line: string, tone: EngineState["departmentStatus"][DepartmentId]["tone"]) {
    this.state.departmentStatus[id] = {
      ...this.state.departmentStatus[id],
      line,
      tone,
      startedAt: Date.now(),
    };
  }

  private rotateStatus(id: DepartmentId) {
    const lines = STATUS_DEFAULTS[id];
    const choice = lines[Math.floor(Math.random() * lines.length)];
    this.setDeptStatus(id, choice, "working");
    this.emit();
  }

  /** -------- Incoming messages (the heart of the demo) -------- */
  private spawnIncoming(prime = false) {
    const tpl = INDUSTRIES[this.state.industry];
    const pick = prime
      ? tpl.incoming[0]
      : tpl.incoming[Math.floor(Math.random() * tpl.incoming.length)];
    const spec = pick();

    const msg: IncomingMessage = {
      id: makeId(),
      customer: { name: spec.customer, channel: spec.channel },
      text: spec.text,
      receivedAt: Date.now(),
    };
    this.state.inbox.unshift(msg);
    if (this.state.inbox.length > 12) this.state.inbox.length = 12;
    this.addTimeline({
      type: "tool_call",
      department: "support",
      title: `New ${spec.channel} message from ${spec.customer}`,
      description: spec.text,
      status: "info",
    });
    this.emit();
    this.runFlow(spec.flow, msg);
  }

  /** -------- Task execution -------- */
  createTask(input: {
    title: string;
    department: DepartmentId;
    assignee: string;
    steps: ToolStep[];
    onDone?: () => void;
  }) {
    const task: Task = {
      id: makeId(),
      title: input.title,
      department: input.department,
      status: "queued",
      progress: 0,
      startedAt: Date.now(),
      assignee: input.assignee,
      toolCalls: [],
      handoffs: [],
    };
    this.state.activeTasks.unshift(task);
    this.addTimeline({
      type: "task_completed",
      department: input.department,
      title: "Task started",
      description: input.title,
      status: "info",
    });
    this.emit();
    this.runSteps(task, input.steps).then(() => {
      this.state.departmentStatus[task.department].completedTasksToday++;
      input.onDone?.();
    });
    return task;
  }

  private async runSteps(task: Task, steps: ToolStep[]) {
    task.status = "running";
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      task.progress = Math.round((i / steps.length) * 100);
      this.emit();
      if (step.type === "tool") {
        await this.runTool(task, step);
      } else if (step.type === "handoff") {
        await this.runHandoff(task, step);
      } else if (step.type === "think") {
        this.setDeptStatus(task.department, step.label, "working");
        await new Promise((r) => setTimeout(r, step.duration ?? 650));
      } else if (step.type === "status") {
        this.setDeptStatus(step.dept, step.line, step.tone);
        this.emit();
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    task.progress = 100;
    task.status = "completed";
    task.completedAt = Date.now();
    this.state.metrics.automationsCompleted++;
    this.state.metrics.hoursSaved += 0.08;
    this.addTimeline({
      type: "task_completed",
      department: task.department,
      title: "Task completed",
      description: task.title,
      status: "success",
    });
    this.emit();
    setTimeout(() => {
      this.state.activeTasks = this.state.activeTasks.filter((t) => t.id !== task.id);
      this.emit();
    }, 3500);
  }

  private async runTool(task: Task, step: Extract<ToolStep, { type: "tool" }>) {
    const dept = step.deptHint ?? task.department;
    const toolId = step.tool as ToolId;
    const toolCall: ToolCall = {
      id: makeId(),
      tool: toolId,
      toolName: toolNames[toolId] ?? step.tool,
      department: dept,
      status: "running",
      startedAt: Date.now(),
      input: step.input,
    };
    task.toolCalls.push(toolCall.id);
    this.state.toolCalls.unshift(toolCall);
    if (this.state.toolCalls.length > 30) this.state.toolCalls.length = 30;
    this.setDeptStatus(dept, step.label, "working");
    this.addTimeline({
      type: "tool_call",
      department: dept,
      title: `${toolCall.toolName}`,
      description: step.label,
      status: "running",
      metadata: { toolCallId: toolCall.id },
    });
    this.emit();

    const delay = 900 + Math.random() * 1600;
    await new Promise((r) => setTimeout(r, delay));

    toolCall.status = "success";
    toolCall.completedAt = Date.now();
    toolCall.duration = delay;
    toolCall.output = step.output ?? { success: true };

    if (step.memoryWrite) {
      this.state.memory.unshift({
        id: makeId(),
        type: step.memoryWrite.type,
        key: step.memoryWrite.key,
        value: step.memoryWrite.key,
        source: dept,
        createdAt: Date.now(),
        accessCount: 0,
        confidence: 0.9,
      });
    }
    if (step.revenue) this.state.metrics.revenueGenerated += step.revenue;
    if (step.lead) this.state.metrics.leadsClosed += 1;
    if (step.customer) this.state.metrics.customersHelped += 1;
    if (step.appointment) this.state.metrics.appointmentsBooked += 1;
    if (step.order) this.state.metrics.ordersClosed += 1;

    this.addTimeline({
      type: "tool_call",
      department: dept,
      title: `${toolCall.toolName} complete`,
      description: step.label,
      status: "success",
      metadata: { toolCallId: toolCall.id },
    });
    this.emit();
  }

  private async runHandoff(task: Task, step: Extract<ToolStep, { type: "handoff" }>) {
    const handoff: Handoff = {
      id: makeId(),
      from: task.department,
      to: step.to,
      task: step.request,
      status: "in_progress",
      startedAt: Date.now(),
      context: step.context,
    };
    task.handoffs.push(handoff.id);
    this.state.handoffs.unshift(handoff);
    if (this.state.handoffs.length > 20) this.state.handoffs.length = 20;
    task.status = "waiting_handoff";
    this.setDeptStatus(task.department, `Handing off to ${deptLabel[step.to]}`, "handoff");
    this.setDeptStatus(step.to, `Receiving from ${deptLabel[task.department]}`, "handoff");
    this.addTimeline({
      type: "handoff",
      department: step.to,
      title: `${deptLabel[task.department]} → ${deptLabel[step.to]}`,
      description: step.request,
      status: "running",
      metadata: { handoffId: handoff.id },
    });
    this.emit();
    await new Promise((r) => setTimeout(r, 1100 + Math.random() * 700));
    handoff.status = "completed";
    handoff.completedAt = Date.now();
    task.status = "running";
    this.addTimeline({
      type: "handoff",
      department: step.to,
      title: `${deptLabel[step.to]} accepted handoff`,
      description: step.request,
      status: "success",
      metadata: { handoffId: handoff.id },
    });
    this.emit();
  }

  addTimeline(e: Omit<TimelineEvent, "id" | "timestamp">) {
    this.state.timeline.unshift({ ...e, id: makeId(), timestamp: Date.now() });
    if (this.state.timeline.length > 80) this.state.timeline.length = 80;
  }

  private pushResult(r: Omit<ResultNotification, "id" | "at">) {
    this.state.results.unshift({ ...r, id: makeId(), at: Date.now() });
    if (this.state.results.length > 25) this.state.results.length = 25;
  }

  private tick() {
    const roll = Math.random();
    if (roll < 0.5) {
      const choices: Array<() => void> = [
        () => {
          this.state.metrics.customersHelped += 1;
          this.setDeptStatus("support", "Replied to a quick FAQ", "done");
          this.addTimeline({ type: "tool_call", department: "support", title: "FAQ answered", description: "Response sent in 1.4s", status: "success" });
        },
        () => {
          this.setDeptStatus("operations", "Synced inventory across channels", "done");
          this.addTimeline({ type: "integration_sync", department: "operations", title: "Inventory synced", description: "All channels up to date", status: "success" });
        },
        () => {
          this.setDeptStatus("marketing", "Scheduling Instagram story", "working");
          this.addTimeline({ type: "decision", department: "marketing", title: "Content queued", description: "Story scheduled for 6 PM", status: "info" });
        },
        () => {
          this.addTimeline({ type: "integration_sync", department: "sales", title: "CRM synced", description: "Pipeline updated", status: "success" });
        },
      ];
      choices[Math.floor(Math.random() * choices.length)]();
    }
    this.state.metrics.hoursSaved += 0.01;
    this.emit();
  }

  // ------------------- INDUSTRY FLOWS -------------------
  private runFlow(flow: string, msg: IncomingMessage) {
    const tpl = INDUSTRIES[this.state.industry];
    const firstProduct = tpl.products[0];

    switch (flow) {
      case "cakeInquiry": {
        const cake = tpl.products.find((p) => /cake/i.test(p.name)) ?? firstProduct;
        this.setDeptStatus("support", `New message from ${msg.customer.name}`, "working");
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "think", label: "Reading the message" },
            { type: "tool", tool: "faqs", label: "Checking FAQs for availability", input: { query: cake.name }, output: { found: true } },
            { type: "tool", tool: "inventory", label: `Verifying stock: ${cake.name}`, input: { sku: cake.name }, output: { stock: cake.stock, available: cake.stock > 0 } },
            { type: "status", dept: "support", line: `Replying to ${msg.customer.name}: yes, ${cake.stock} available`, tone: "working" as const },
            { type: "handoff", to: "sales", request: "Customer interested — send offer", context: cake.name },
            { type: "tool", tool: "crm", deptHint: "sales", label: `Logging ${msg.customer.name} in CRM`, input: { source: "whatsapp", product: cake.name }, output: { lead_id: "LD-" + Math.floor(Math.random() * 9999) }, lead: true },
            { type: "tool", tool: "payments", deptHint: "sales", label: "Generating payment link", input: { amount: cake.price, desc: cake.name }, output: { amount: cake.price, link: "rzp.io/i/" + Math.random().toString(36).slice(2, 8) }, revenue: cake.price },
            { type: "handoff", to: "operations", request: "Reserve 1 unit for pickup", context: cake.name },
            { type: "tool", tool: "inventory", deptHint: "operations", label: `Reserving ${cake.name}`, input: { sku: cake.name, hold: 1 }, output: { reserved: true } },
            { type: "tool", tool: "orders", deptHint: "operations", label: "Creating order #A" + Math.floor(100 + Math.random() * 899), output: { order_id: "A" + Math.floor(100 + Math.random() * 899) }, order: true },
            { type: "handoff", to: "finance", request: "Log pending payment", context: cake.name },
            { type: "tool", tool: "sheets", deptHint: "finance", label: "Logging to Finance sheet", input: { amount: cake.price } },
            { type: "handoff", to: "support", request: "Send confirmation + payment link", context: cake.name },
            { type: "tool", tool: "whatsapp", label: `Sending confirmation to ${msg.customer.name}`, input: { to: msg.customer.name }, output: { delivered: true }, customer: true, memoryWrite: { type: "customer" as const, key: `${msg.customer.name} · inquired about ${cake.name}` } },
            { type: "think", label: "Order handled end-to-end" },
          ],
          onDone: () => {
            this.pushResult({
              icon: "order",
              title: `New reservation from ${msg.customer.name}`,
              detail: `${cake.name} · ₹${cake.price} · payment link sent`,
              department: "sales",
            });
          },
        });
        return;
      }
      case "appointment": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "think", label: "Reading appointment request" },
            { type: "tool", tool: "faqs", label: "Checking available slots for tomorrow", output: { slots: ["11:00 AM", "3:30 PM", "5:00 PM"] } },
            { type: "handoff", to: "sales", request: "Offer a slot & collect deposit", context: "Checkup" },
            { type: "tool", tool: "calendar", deptHint: "sales", label: "Proposing 3:30 PM tomorrow", output: { slot: "3:30 PM" } },
            { type: "tool", tool: "payments", deptHint: "sales", label: "Generating deposit link (20%)", output: { amount: 240, link: "rzp.io/i/dep" + Math.floor(Math.random() * 999) }, revenue: 240, lead: true },
            { type: "handoff", to: "finance", request: "Create GST invoice for deposit", context: "Deposit" },
            { type: "tool", tool: "invoices", deptHint: "finance", label: "Generating GST invoice", output: { invoice: "INV-" + Math.floor(1000 + Math.random() * 8999) } },
            { type: "handoff", to: "marketing", request: "Queue reminder 24h before", context: "Reminder" },
            { type: "tool", tool: "calendar", deptHint: "marketing", label: "Scheduling WhatsApp reminder", output: { queued: true } },
            { type: "handoff", to: "support", request: "Confirm booking to patient", context: "Confirm" },
            { type: "tool", tool: "whatsapp", label: `Confirming appointment for ${msg.customer.name}`, output: { delivered: true }, customer: true, appointment: true, memoryWrite: { type: "customer" as const, key: `${msg.customer.name} · checkup booked tomorrow 3:30 PM` } },
            { type: "think", label: "Appointment booked" },
          ],
          onDone: () => {
            this.pushResult({
              icon: "appointment",
              title: `Appointment booked · ${msg.customer.name}`,
              detail: "Tomorrow, 3:30 PM · ₹240 deposit paid",
              department: "support",
            });
          },
        });
        return;
      }
      case "feesInquiry": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "think", label: "Reading fee inquiry" },
            { type: "tool", tool: "faqs", label: "Pulling membership pricing", output: { monthly: 2499, quarterly: 5999, trial: 199 } },
            { type: "status", dept: "support", line: `Replying to ${msg.customer.name} with plans`, tone: "working" as const },
            { type: "handoff", to: "sales", request: "Offer a trial to prospect", context: "Monthly inquiry" },
            { type: "tool", tool: "crm", deptHint: "sales", label: "Creating lead in CRM", output: { lead_id: "LD-" + Math.floor(9000 + Math.random() * 999) }, lead: true },
            { type: "tool", tool: "calendar_book", deptHint: "sales", label: "Booking a 1-day trial slot", output: { slot: "Tomorrow 7 AM" }, appointment: true },
            { type: "handoff", to: "marketing", request: "Send welcome message + tour", context: "Welcome" },
            { type: "tool", tool: "social", deptHint: "marketing", label: "Queuing welcome WhatsApp", output: { queued: true } },
            { type: "handoff", to: "support", request: "Send plans + trial confirmation", context: "Monthly fee" },
            { type: "tool", tool: "whatsapp", label: `Sending plans + trial slot to ${msg.customer.name}`, output: { delivered: true }, customer: true, memoryWrite: { type: "customer" as const, key: `${msg.customer.name} · interested in monthly + trial booked` } },
            { type: "think", label: "Lead nurtured" },
          ],
          onDone: () => {
            this.pushResult({
              icon: "lead",
              title: `New lead · ${msg.customer.name}`,
              detail: "₹2,499 monthly plan · trial booked for tomorrow",
              department: "sales",
            });
          },
        });
        return;
      }
      case "quickOrder": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Order Tracker",
          steps: [
            { type: "think", label: "Reading quick pickup order" },
            { type: "handoff", to: "operations", request: "Reserve 2 croissants for pickup", context: "Pickup" },
            { type: "tool", tool: "inventory", deptHint: "operations", label: "Reserving 2 × Butter Croissant", output: { reserved: 2 }, order: true },
            { type: "handoff", to: "sales", request: "Send quick payment link", context: "Payment" },
            { type: "tool", tool: "payments", deptHint: "sales", label: "Generating ₹180 link", output: { amount: 180 }, revenue: 180 },
            { type: "handoff", to: "finance", request: "Log cash sale", context: "Logging" },
            { type: "tool", tool: "sheets", deptHint: "finance", label: "Logging sale", input: { amount: 180 } },
            { type: "tool", tool: "whatsapp", label: `Pickup confirmation to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "order",
              title: `Pickup order · ${msg.customer.name}`,
              detail: "2 × Butter Croissant · ₹180 · ready in 20 min",
              department: "operations",
            });
          },
        });
        return;
      }
      case "customCake": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Escalation Manager",
          steps: [
            { type: "think", label: "Custom cake request" },
            { type: "tool", tool: "faqs", label: "Looking up custom cake policy", output: { notice: "24h", min_weight: "500g" } },
            { type: "handoff", to: "sales", request: "Quote for custom birthday cake (10 ppl)", context: "Birthday" },
            { type: "tool", tool: "crm", deptHint: "sales", label: "Creating lead", output: { lead_id: "LD-" + Math.floor(9000 + Math.random() * 999) }, lead: true },
            { type: "tool", tool: "gmail", deptHint: "sales", label: "Sending menu + quote email", output: { sent: true } },
            { type: "tool", tool: "calendar", deptHint: "sales", label: "Suggesting consultation slots", output: { slots_proposed: 3 } },
            { type: "tool", tool: "whatsapp", label: `Reply sent to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "reply",
              title: `Custom cake quote sent · ${msg.customer.name}`,
              detail: "Quote + menu shared, waiting for confirmation",
              department: "sales",
            });
          },
        });
        return;
      }
      case "reschedule": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "tool", tool: "calendar", label: "Finding existing appointment", output: { found: true, date: "Friday 4 PM" } },
            { type: "tool", tool: "calendar", label: "Proposing new slots next week", output: { slots: ["Mon 2 PM", "Wed 11 AM"] } },
            { type: "tool", tool: "gmail", label: "Emailing reschedule confirmation", output: { sent: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "appointment",
              title: `Rescheduled · ${msg.customer.name}`,
              detail: "New slots proposed for next week",
              department: "support",
            });
          },
        });
        return;
      }
      case "urgent": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Escalation Manager",
          steps: [
            { type: "status", dept: "support", line: `URGENT: ${msg.customer.name} has toothache`, tone: "working" as const },
            { type: "tool", tool: "calendar", label: "Finding nearest same-day slot", output: { slot: "Today 4 PM" } },
            { type: "handoff", to: "operations", request: "Reserve slot for urgent case", context: "Toothache" },
            { type: "tool", tool: "slack", deptHint: "operations", label: "Alerting Dr. Aarish", output: { notified: true } },
            { type: "tool", tool: "whatsapp", label: `Confirming emergency slot to ${msg.customer.name}`, output: { delivered: true }, customer: true, appointment: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "appointment",
              title: `Emergency slot booked · ${msg.customer.name}`,
              detail: "Today 4 PM · Dr. Aarish notified",
              department: "support",
            });
          },
        });
        return;
      }
      case "trialBooking": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "tool", tool: "calendar", label: "Checking 7 AM slot", output: { available: true } },
            { type: "handoff", to: "sales", request: "Book trial + send waiver", context: "Tomorrow 7 AM" },
            { type: "tool", tool: "crm", deptHint: "sales", label: "Creating lead", output: { lead_id: "LD-" + Math.floor(9000 + Math.random() * 999) }, lead: true },
            { type: "tool", tool: "calendar_book", deptHint: "sales", label: "Booking trial for tomorrow 7 AM", output: { booked: true }, appointment: true },
            { type: "tool", tool: "payments", deptHint: "sales", label: "Generating ₹199 trial link", output: { amount: 199 }, revenue: 199 },
            { type: "tool", tool: "whatsapp", label: `Confirming trial + waiver to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "appointment",
              title: `Trial booked · ${msg.customer.name}`,
              detail: "Tomorrow 7 AM · ₹199 paid",
              department: "sales",
            });
          },
        });
        return;
      }
      case "trainerInquiry": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "tool", tool: "calendar", label: "Checking trainer availability this evening", output: { slots: ["6 PM", "7:30 PM", "9 PM"] } },
            { type: "tool", tool: "crm", label: "Logging interest", output: { lead_id: "LD-" + Math.floor(9000 + Math.random() * 999) }, lead: true },
            { type: "tool", tool: "whatsapp", label: `Sending trainer slots + rates to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "reply",
              title: `Trainer inquiry replied · ${msg.customer.name}`,
              detail: "3 evening slots shared",
              department: "support",
            });
          },
        });
        return;
      }
      case "reservation": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "tool", tool: "calendar", label: "Checking 9 PM availability for 4", output: { available: true } },
            { type: "handoff", to: "operations", request: "Reserve table for 4 at 9 PM", context: msg.customer.name },
            { type: "tool", tool: "sheets", deptHint: "operations", label: "Adding to reservations log", output: { added: true } },
            { type: "tool", tool: "whatsapp", label: `Confirming reservation to ${msg.customer.name}`, output: { delivered: true }, customer: true, appointment: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "appointment",
              title: `Reservation confirmed · ${msg.customer.name}`,
              detail: "Table for 4 · Tonight 9 PM",
              department: "operations",
            });
          },
        });
        return;
      }
      case "deliveryOrder": {
        const dish = tpl.products[0];
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Order Tracker",
          steps: [
            { type: "tool", tool: "faqs", label: "Checking delivery zone (Sector 29)", output: { eligible: true, eta: "35 min" } },
            { type: "tool", tool: "inventory", label: `Checking ${dish.name} stock`, output: { stock: 40, available: true } },
            { type: "handoff", to: "sales", request: "Create order + payment link", context: dish.name },
            { type: "tool", tool: "crm", deptHint: "sales", label: "Logging order", output: { order_id: "#T" + Math.floor(200 + Math.random() * 799) } },
            { type: "tool", tool: "payments", deptHint: "sales", label: `Generating ₹${dish.price + 40} link (incl. delivery)`, output: { amount: dish.price + 40 }, revenue: dish.price + 40, order: true },
            { type: "handoff", to: "operations", request: "Dispatch to Sector 29", context: dish.name },
            { type: "tool", tool: "orders", deptHint: "operations", label: "Assigning to rider", output: { eta: "35 min" } },
            { type: "tool", tool: "whatsapp", label: `Order confirmation + ETA to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "order",
              title: `Delivery order · ${msg.customer.name}`,
              detail: `${dish.name} · ETA 35 min · Sector 29`,
              department: "operations",
            });
          },
        });
        return;
      }
      case "productInquiry": {
        const p = tpl.products[0];
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "tool", tool: "faqs", label: "Looking up product availability", output: { name: p.name } },
            { type: "tool", tool: "inventory", label: `Live stock for ${p.name}`, output: { stock: p.stock, available: true } },
            { type: "handoff", to: "sales", request: "Send product link + offer", context: p.name },
            { type: "tool", tool: "crm", deptHint: "sales", label: "Logging interest", output: { lead_id: "LD-" + Math.floor(9000 + Math.random() * 999) }, lead: true },
            { type: "tool", tool: "payments", deptHint: "sales", label: "Generating buy link", output: { amount: p.price, link: "rzp.io/i/" + Math.random().toString(36).slice(2, 8) } },
            { type: "tool", tool: "whatsapp", label: `Replying to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "reply",
              title: `Availability reply sent · ${msg.customer.name}`,
              detail: `${p.name} · ${p.stock} in stock · buy link shared`,
              department: "support",
            });
          },
        });
        return;
      }
      case "return": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Escalation Manager",
          steps: [
            { type: "tool", tool: "orders", label: "Fetching recent orders", output: { found: true, order: "#NW-4821" } },
            { type: "tool", tool: "faqs", label: "Checking return policy", output: { eligible: true, window: "7 days" } },
            { type: "handoff", to: "finance", request: "Initiate refund process", context: "Return request" },
            { type: "tool", tool: "sheets", deptHint: "finance", label: "Queuing refund review", output: { queued: true } },
            { type: "tool", tool: "gmail", label: `Return instructions sent to ${msg.customer.name}`, output: { sent: true }, customer: true },
          ],
          onDone: () => {
            this.pushResult({
              icon: "reply",
              title: `Return instructions sent · ${msg.customer.name}`,
              detail: "Order #NW-4821 · refund queued",
              department: "support",
            });
          },
        });
        return;
      }
      case "lead": {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "sales",
          assignee: "Lead Qualifier",
          steps: [
            { type: "tool", tool: "crm", label: "Creating lead", output: { lead_id: "LD-" + Math.floor(9000 + Math.random() * 999) }, lead: true },
            { type: "tool", tool: "gmail", label: "Sending portfolio + pricing", output: { sent: true } },
            { type: "tool", tool: "calendar", label: "Proposing discovery slots", output: { slots: 3 } },
            { type: "tool", tool: "slack", deptHint: "marketing", label: "Notifying team of new lead", output: { notified: true } },
            { type: "tool", tool: "email_marketing", deptHint: "marketing", label: "Queuing nurture sequence", output: { queued: true } },
          ],
          onDone: () => {
            this.pushResult({
              icon: "lead",
              title: `Lead qualified · ${msg.customer.name}`,
              detail: "Landing page redesign · discovery slots sent",
              department: "sales",
            });
          },
        });
        return;
      }
      default: {
        this.createTask({
          title: `${msg.customer.name}: "${msg.text}"`,
          department: "support",
          assignee: "Inbox Resolver",
          steps: [
            { type: "tool", tool: "faqs", label: "Looking up an answer" },
            { type: "tool", tool: "whatsapp", label: `Replying to ${msg.customer.name}`, output: { delivered: true }, customer: true },
          ],
        });
      }
    }
  }

  // Manual entry points used by UI
  runOrderFlow() { this.spawnIncoming(true); }
  runAppointmentFlow() {
    this.runFlow("appointment", { id: makeId(), customer: { name: "Neha T.", channel: "whatsapp" }, text: "Are you free tomorrow?", receivedAt: Date.now() });
  }
  runLeadFlow() {
    this.runFlow("feesInquiry", { id: makeId(), customer: { name: "Ritika B.", channel: "whatsapp" }, text: "Fees kitni hai?", receivedAt: Date.now() });
  }

  async handleUserRequest(text: string): Promise<void> {
    const lc = text.toLowerCase();
    for (const d of DEPARTMENTS) {
      if (lc.includes(d.name.toLowerCase()) && /activate|wake|turn on|hire/.test(lc)) {
        this.setDeptStatus(d.id, `${d.name} coming online`, "working");
        this.addTimeline({ type: "decision", department: d.id, title: `${d.name} activated`, description: "Booting agents", status: "running" });
        return;
      }
    }
    if (/cake|order|buy|stock|available|in stock/.test(lc)) this.spawnIncoming(true);
    else if (/appointment|book|slot|tomorrow|checkup/.test(lc)) this.runAppointmentFlow();
    else if (/fee|price|cost|membership|trial/.test(lc)) this.runLeadFlow();
    else if (/invoice|expense|bill/.test(lc)) {
      this.createTask({
        title: "Process new vendor invoice",
        department: "finance",
        assignee: "Invoice Matcher",
        steps: [
          { type: "tool", tool: "gmail", label: "Reading bill from inbox" },
          { type: "tool", tool: "sheets", label: "Categorizing & logging expense", input: { category: "Software", amount: 499 } },
          { type: "tool", tool: "invoices", label: "Matching to open PO" },
        ],
      });
    } else this.spawnIncoming(true);
  }
}

export type ToolStep =
  | { type: "think"; label: string; detail?: string; duration?: number }
  | {
      type: "tool";
      tool: string;
      label: string;
      input?: Record<string, unknown>;
      output?: Record<string, unknown>;
      deptHint?: DepartmentId;
      memoryWrite?: { type: MemoryEntry["type"]; key: string };
      revenue?: number;
      lead?: boolean;
      customer?: boolean;
      appointment?: boolean;
      order?: boolean;
    }
  | { type: "handoff"; to: DepartmentId; request: string; context: string }
  | {
      type: "status";
      dept: DepartmentId;
      line: string;
      tone: "idle" | "working" | "handoff" | "done";
    };

// --- React hooks ---
import { useEffect, useSyncExternalStore } from "react";

// Persist & restore selected industry across reloads
const STORAGE_KEY = "azolik:industry:v1";
function readIndustry(): Industry {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (raw && raw in INDUSTRIES) return raw as Industry;
  } catch { /* ignore */ }
  return "bakery";
}
const initialIndustry: Industry = typeof window !== "undefined" ? readIndustry() : "bakery";

class PersistentEngine extends Engine {
  constructor(initial: Industry) {
    super(initial);
  }
  override setIndustry(industry: Industry) {
    super.setIndustry(industry);
    try { window.localStorage?.setItem(STORAGE_KEY, industry); } catch { /* ignore */ }
  }
}

const engine = new PersistentEngine(initialIndustry);

export function useEngine() {
  return useSyncExternalStore(
    (cb) => engine.subscribe(cb),
    () => engine.state,
    () => engine.state
  );
}

export function useEngineStart() {
  useEffect(() => {
    engine.start();
    return () => engine.stop();
  }, []);
}

export function executeRequest(text: string) {
  return engine.handleUserRequest(text);
}

export function switchIndustry(industry: Industry) {
  engine.setIndustry(industry);
}

export const INDUSTRIES_META: Record<Industry, { name: string; emoji: string; tagline: string }> = {
  bakery: { name: "Bakery", emoji: "🥖", tagline: "Cakes, bread & pastries" },
  dental: { name: "Dental Clinic", emoji: "🦷", tagline: "Appointments & patient care" },
  gym: { name: "Gym & Fitness", emoji: "💪", tagline: "Memberships & training" },
  restaurant: { name: "Restaurant", emoji: "🍽️", tagline: "Orders & reservations" },
  ecommerce: { name: "E-commerce", emoji: "📦", tagline: "Products & support" },
  agency: { name: "Creative Agency", emoji: "🎨", tagline: "Leads & projects" },
};

export { DEPARTMENTS };

export const workforceEngine = engine;
