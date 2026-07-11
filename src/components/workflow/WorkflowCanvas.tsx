import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import {
  Bot,
  MessageSquare,
  TrendingUp,
  Megaphone,
  Settings2,
  Calculator,
  Users,
  Zap,
  Mail,
  Play,
  Brain,
  Wrench,
  ArrowRightLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { workforceEngine } from "@/lib/engine";
import { DEPARTMENTS } from "@/data/departments";

type NodeData = {
  label: string;
  dept?: string;
  status?: "running" | "idle" | "queued" | "active" | "done";
  icon?: any;
  color?: string;
  sub?: string;
  kind?: "trigger" | "agent" | "tool" | "handoff";
};

const deptNodeColor: Record<string, string> = {
  Support: "from-cyan-500/40 to-cyan-700/20 text-cyan-200 border-cyan-400/30",
  Sales: "from-emerald-500/40 to-emerald-700/20 text-emerald-200 border-emerald-400/30",
  Marketing: "from-violet-500/40 to-violet-700/20 text-violet-200 border-violet-400/30",
  Operations: "from-amber-500/40 to-amber-700/20 text-amber-200 border-amber-400/30",
  Finance: "from-rose-500/40 to-rose-700/20 text-rose-200 border-rose-400/30",
  HR: "from-brand-500/40 to-brand-700/20 text-brand-200 border-brand-400/30",
  Trigger: "from-slate-500/40 to-slate-700/20 text-slate-200 border-slate-400/30",
  Tool: "from-white/10 to-white/[0.02] text-ink-200 border-white/10",
  Handoff: "from-brand-500/30 to-brand-700/10 text-brand-200 border-brand-400/30",
};

// Static template nodes shown when nothing is running
const staticNodes: Node<NodeData>[] = [
  { id: "t1", type: "ai", position: { x: 0, y: 160 }, data: { label: "New Request", dept: "Trigger", icon: Mail, status: "idle", sub: "User / webhook", kind: "trigger" } },
  { id: "a1", type: "ai", position: { x: 240, y: 60 }, data: { label: "Inbox Resolver", dept: "Support", icon: MessageSquare, status: "idle", sub: "Support agent", kind: "agent" } },
  { id: "a2", type: "ai", position: { x: 240, y: 260 }, data: { label: "Knowledge Scout", dept: "Support", icon: Brain, status: "idle", sub: "FAQ search", kind: "agent" } },
  { id: "h1", type: "ai", position: { x: 500, y: 160 }, data: { label: "Route to team", dept: "Handoff", icon: ArrowRightLeft, status: "idle", sub: "Smart routing", kind: "handoff" } },
  { id: "a3", type: "ai", position: { x: 760, y: 60 }, data: { label: "Deal Desk", dept: "Sales", icon: TrendingUp, status: "idle", sub: "Payment links", kind: "agent" } },
  { id: "a4", type: "ai", position: { x: 760, y: 260 }, data: { label: "Stock Keeper", dept: "Operations", icon: Settings2, status: "idle", sub: "Inventory", kind: "agent" } },
  { id: "tool", type: "ai", position: { x: 1020, y: 160 }, data: { label: "Send via WhatsApp", dept: "Tool", icon: Wrench, status: "idle", sub: "Outbound message", kind: "tool" } },
];

const staticEdges: Edge[] = [
  { id: "e-t1-a1", source: "t1", target: "a1", animated: false, style: { stroke: "rgba(143,174,255,0.15)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-t1-a2", source: "t1", target: "a2", animated: false, style: { stroke: "rgba(143,174,255,0.15)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-a1-h1", source: "a1", target: "h1", animated: false, style: { stroke: "rgba(143,174,255,0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-a2-h1", source: "a2", target: "h1", animated: false, style: { stroke: "rgba(143,174,255,0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-h1-a3", source: "h1", target: "a3", animated: false, style: { stroke: "rgba(52,211,153,0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-h1-a4", source: "h1", target: "a4", animated: false, style: { stroke: "rgba(251,191,36,0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-a3-tool", source: "a3", target: "tool", animated: false, style: { stroke: "rgba(34,211,238,0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
  { id: "e-a4-tool", source: "a4", target: "tool", animated: false, style: { stroke: "rgba(34,211,238,0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" } },
];

const deptIcon: Record<string, any> = {
  support: MessageSquare,
  sales: TrendingUp,
  marketing: Megaphone,
  operations: Settings2,
  finance: Calculator,
  hr: Users,
};

function AINode({ data, selected }: NodeProps<Node<NodeData>>) {
  const Icon = data.icon || Bot;
  const isRunning = data.status === "running" || data.status === "active";
  const isDone = data.status === "done";
  const deptKey = data.dept ?? "Trigger";
  return (
    <div className="relative">
      {isRunning && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          style={{
            background: data.color
              ? `radial-gradient(closest-side, ${data.color}, transparent 70%)`
              : "radial-gradient(closest-side, rgba(95,131,255,0.5), transparent 70%)",
          }}
        />
      )}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-0"
        style={{ background: data.color ?? "#5f83ff", boxShadow: `0 0 8px ${data.color ?? "rgba(95,131,255,0.9)"}` }}
      />
      <div
        className={cn(
          "relative min-w-[200px] rounded-2xl border bg-gradient-to-b to-[80%] p-3 backdrop-blur-xl",
          "bg-ink-900/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]",
          deptNodeColor[deptKey] ?? deptNodeColor.Trigger,
          selected && "ring-2 ring-brand-400/60",
          isDone && "opacity-70"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-inset ring-white/10",
              isRunning && "animate-pulse"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[13px] font-semibold text-white">{data.label}</span>
              {isRunning && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              )}
            </div>
            {data.sub && <div className="mt-0.5 truncate text-[10.5px] text-ink-300">{data.sub}</div>}
            <div className="mt-2 flex items-center gap-1.5 text-[10px]">
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-medium uppercase tracking-wider",
                  data.status === "running" && "bg-emerald-500/15 text-emerald-200",
                  data.status === "active" && "bg-brand-500/15 text-brand-200",
                  data.status === "queued" && "bg-brand-500/15 text-brand-200",
                  data.status === "done" && "bg-ink-500/20 text-ink-300",
                  (data.status === "idle" || !data.status) && "bg-white/5 text-ink-400"
                )}
              >
                {data.status === "running"
                  ? "running"
                  : data.status === "active"
                  ? "active"
                  : data.status === "queued"
                  ? "queued"
                  : data.status === "done"
                  ? "done"
                  : "idle"}
              </span>
              {data.dept && <span className="text-ink-500">· {data.dept}</span>}
            </div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-0"
        style={{ background: data.color ?? "#5f83ff", boxShadow: `0 0 8px ${data.color ?? "rgba(95,131,255,0.9)"}` }}
      />
    </div>
  );
}

const nodeTypes = { ai: AINode };

export function WorkflowCanvas() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 800);
    return () => window.clearInterval(id);
  }, []);

  const activeTasks = workforceEngine.state.activeTasks;
  const live = activeTasks.length > 0;

  // Build a live graph from the first active task
  const { nodes, edges, runningCount } = React.useMemo(() => {
    if (!live) return { nodes: staticNodes, edges: staticEdges, runningCount: 0 };
    const task = activeTasks[0];
    const dept = DEPARTMENTS.find((d) => d.id === task.department)!;

    const nodesOut: Node<NodeData>[] = [];
    const edgesOut: Edge[] = [];

    nodesOut.push({
      id: "trigger",
      type: "ai",
      position: { x: 0, y: 160 },
      data: { label: "User request", dept: "Trigger", icon: Zap, status: "done", sub: task.title.slice(0, 28), kind: "trigger", color: "#8faeff" },
    });

    const relevantCalls = workforceEngine.state.toolCalls
      .filter((tc) => task.toolCalls.includes(tc.id))
      .slice(-6);
    const relevantHandoffs = workforceEngine.state.handoffs
      .filter((h) => task.handoffs.includes(h.id))
      .slice(-3);

    let lastId = "trigger";
    let y = 160;
    let xPos = 240;

    const deptForTool = (deptId: string) => DEPARTMENTS.find((d) => d.id === deptId);
    const agentLabel = (deptId: string) =>
      DEPARTMENTS.find((d) => d.id === deptId)?.agents[0]?.name ?? "Agent";

    // Lead agent
    nodesOut.push({
      id: `agent-${task.department}`,
      type: "ai",
      position: { x: xPos, y },
      data: {
        label: agentLabel(task.department),
        dept: dept.name,
        icon: deptIcon[task.department],
        status: task.status === "running" && relevantCalls.length === 0 ? "running" : "done",
        sub: dept.name,
        kind: "agent",
        color: dept.color.primary,
      },
    });
    edgesOut.push({
      id: `e-trigger-${task.department}`,
      source: "trigger",
      target: `agent-${task.department}`,
      animated: true,
      style: { stroke: dept.color.primary, strokeWidth: 2 },
    });
    lastId = `agent-${task.department}`;
    xPos += 260;

    relevantHandoffs.forEach((h, i) => {
      const toDept = DEPARTMENTS.find((d) => d.id === h.to)!;
      nodesOut.push({
        id: `h-${h.id}`,
        type: "ai",
        position: { x: xPos, y },
        data: {
          label: `Handoff → ${toDept.name}`,
          dept: "Handoff",
          icon: ArrowRightLeft,
          status: h.status === "in_progress" ? "running" : "done",
          sub: h.task.slice(0, 28),
          kind: "handoff",
          color: toDept.color.primary,
        },
      });
      edgesOut.push({
        id: `e-${lastId}-h${i}`,
        source: lastId,
        target: `h-${h.id}`,
        animated: h.status === "in_progress",
        style: { stroke: toDept.color.primary, strokeWidth: 2 },
      });
      xPos += 260;
      const agentId = `agent-${h.to}`;
      if (!nodesOut.find((n) => n.id === agentId)) {
        nodesOut.push({
          id: agentId,
          type: "ai",
          position: { x: xPos, y },
          data: {
            label: agentLabel(h.to),
            dept: toDept.name,
            icon: deptIcon[h.to],
            status: h.status === "in_progress" ? "running" : "done",
            sub: toDept.name,
            kind: "agent",
            color: toDept.color.primary,
          },
        });
      }
      edgesOut.push({
        id: `e-h${i}-${h.to}`,
        source: `h-${h.id}`,
        target: agentId,
        animated: h.status === "in_progress",
        style: { stroke: toDept.color.primary, strokeWidth: 2 },
      });
      lastId = agentId;
      xPos += 260;
    });

    relevantCalls.forEach((tc, i) => {
      const d = deptForTool(tc.department);
      const color = d?.color.primary ?? "#8faeff";
      nodesOut.push({
        id: `tc-${tc.id}`,
        type: "ai",
        position: { x: xPos, y: i === 0 ? 100 : i === 1 ? 220 : 160 },
        data: {
          label: tc.toolName,
          dept: "Tool",
          icon: Wrench,
          status: tc.status === "running" ? "running" : tc.status === "error" ? "running" : "done",
          sub: d?.name ?? "",
          kind: "tool",
          color,
        },
      });
      edgesOut.push({
        id: `e-${lastId}-tc${i}`,
        source: lastId,
        target: `tc-${tc.id}`,
        animated: tc.status === "running",
        style: { stroke: color, strokeWidth: 2 },
      });
    });

    return { nodes: nodesOut, edges: edgesOut, runningCount: relevantCalls.filter((c) => c.status === "running").length + relevantHandoffs.filter((h) => h.status === "in_progress").length };
  }, [live, activeTasks.map((t) => t.id + ":" + t.progress).join(","), workforceEngine.state.toolCalls.length, workforceEngine.state.handoffs.length]);

  const runningTask = activeTasks[0];

  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-950/60 backdrop-blur">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        className="!bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.08)" />
        <Controls
          position="bottom-left"
          className="!rounded-xl !border-white/10 !bg-ink-900/80 !backdrop-blur"
        />
        <MiniMap
          className="!rounded-xl !border-white/10 !bg-ink-900/80"
          nodeColor={(n) => (n.data as NodeData).color ?? "#5f83ff"}
          maskColor="rgba(8,9,14,0.7)"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Floating playback bar */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 px-3 py-1.5 text-[12px] shadow-float backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          </span>
          <span className="font-medium text-white">
            {live ? runningTask?.title.slice(0, 42) : "Triage Flow (template)"}
          </span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-300">
            {live ? `${runningCount} executing` : "Idle"}
          </span>
          <span className="mx-2 h-4 w-px bg-white/10" />
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_6px_14px_-4px_rgba(59,91,255,0.6)]">
            <Play className="h-3 w-3" fill="white" />
          </button>
          <span className="text-ink-500">
            {workforceEngine.state.metrics.automationsCompleted.toLocaleString()} runs · 99.8%
          </span>
        </div>
      </div>
    </div>
  );
}
