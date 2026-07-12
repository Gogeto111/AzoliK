import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useEngine } from "@/lib/engine";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Topbar() {
  const engine = useEngine();
  const agentsWorking = engine.metrics.agentsWorking || 0;

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.08 }}
      className="relative z-20 flex h-[64px] items-center justify-between px-8"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 280, damping: 26 }}
          className="flex items-center gap-3"
        >
          <Badge tone="emerald" dot pulse className="h-[18px]">
            {agentsWorking} agents active
          </Badge>
          <Badge tone="cyan" dot className="h-[18px]">
            {engine.metrics.tasksRunning} tasks running
          </Badge>
          <Badge tone="muted" className="h-[18px]">
            {engine.departmentStatus ? Object.keys(engine.departmentStatus).length : 0} departments
          </Badge>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        {engine.metrics.automationsCompleted > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[10.5px] font-medium text-brand-200 ring-1 ring-inset ring-brand-400/25"
          >
            <SparkleDot />
            {engine.metrics.automationsCompleted} automations done
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

function SparkleDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_6px_rgba(143,174,255,0.9)]" />
    </span>
  );
}
