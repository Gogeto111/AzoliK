import * as React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  MessageSquare,
  TrendingUp,
  Megaphone,
  Settings2,
  Calculator,
  Users,
  Bot,
  CheckCircle2,
  Wrench,
  Activity,
  Clock,
  TrendingUp as TrendingUpIcon,
  PauseCircle,
  PlayCircle,
  Building2,
  Shield,
  BarChart2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { db, collection, query, getDocs } from "@/lib/firebase";

const STATUS_LABELS: Record<string, { label: string; tone: "emerald" | "amber" | "muted" | "brand"; icon: any }> = {
  active: { label: "Working", tone: "emerald", icon: Activity },
  training: { label: "Training", tone: "amber", icon: Bot },
  idle: { label: "On standby", tone: "muted", icon: Shield },
  paused: { label: "Paused", tone: "muted", icon: Settings2 },
};

interface DeptData {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  agents: number;
  tools: string[];
  stats: any;
}

export default function Departments() {
  const { business } = useAuth();
  const [departments, setDepartments] = React.useState<DeptData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!business?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      const deptQuery = query(collection(db, "businesses", business.id, "departments"));
      const snap = await getDocs(deptQuery);
      setDepartments(snap.docs.map(d => d.data() as DeptData));
      setLoading(false);
    })();
  }, [business?.id]);

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Departments"
          description="Your AI workforce — specialized departments that handle real work."
        />
        <GlassCard className="py-16 text-center" tilt={false}>
          <Building2 className="h-12 w-12 text-ink-500 mx-auto mb-3" />
          <h3 className="text-[16px] font-medium text-white">No business found</h3>
          <p className="mt-1 text-ink-400">Complete onboarding first to set up your departments.</p>
          <Button size="sm" variant="primary" className="mt-4" onClick={() => window.location.href = "/onboarding"}>
            Go to Onboarding
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Departments" description="Loading departments..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-brand-300 animate-spin" />
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div>
        <PageHeader
          title="Departments"
          description="Your AI workforce — specialized departments that handle real work."
        />
        <GlassCard className="py-16 text-center" tilt={false}>
          <Building2 className="h-12 w-12 text-ink-500 mx-auto mb-3" />
          <h3 className="text-[16px] font-medium text-white">No departments yet</h3>
          <p className="mt-1 text-ink-400">Departments will appear here once onboarding is complete.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Your AI workforce — specialized departments that handle real work."
        badge={{ label: `${departments.filter((d) => d.enabled).length} of ${departments.length} online`, tone: "emerald", dot: true }}
      />

      <div className="space-y-5">
        {departments.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 240, damping: 28 }}
          >
            <GlassCard className="relative overflow-hidden p-0" tilt={false} interactive={false}>
              <div className="relative grid gap-5 p-6 md:grid-cols-[auto_1fr_auto]">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <Bot className="h-7 w-7 text-brand-300" strokeWidth={1.9} />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{d.name}</h3>
                    <Badge tone={d.enabled ? "emerald" : "muted"} dot={d.enabled}>
                      {d.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-300">{d.type} department</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    <Stat label="Agents" value={String(d.agents)} icon={Bot} />
                    <Stat label="Tools" value={String(d.tools?.length || 0)} icon={Wrench} />
                    <Stat label="Status" value={d.enabled ? "Online" : "Offline"} icon={Activity} />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button size="sm" variant="primary" onClick={() => window.location.href = `/departments/${d.id}`}>
                    <Building2 className="h-3.5 w-3.5" /> Open Department
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset">
        <Icon className="h-3.5 w-3.5 text-brand-300" />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[13px] font-semibold tabular-nums text-white">{value}</div>
        <div className="truncate text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      </div>
    </div>
  );
}