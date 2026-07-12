import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Brain, 
  Users, 
  Briefcase, 
  BarChart3, 
  CreditCard, 
  Wrench,
  MessageSquare,
  ShoppingBag,
  Factory,
  HeartPulse,
  GraduationCap,
  Truck,
  Building2,
  Scale,
  Loader2,
  Check,
  ChevronRight,
  MinusCircle,
  PlusCircle,
  Brain as BrainIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  FileText,
  Link2,
  Cpu,
  UtensilsCrossed,
  Store,
  Stethoscope,
  Dumbbell,
  Sparkles as SparklesIcon,
  Briefcase as BriefcaseIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createBusiness } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function DiscoveryStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const { user, profile } = useAuth();
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverBusiness = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.azolik.ai/api/business/discover?phone=${profile?.phoneNumber || user?.phoneNumber}`);
      if (!response.ok) throw new Error("Discovery failed");
      const data = await response.json();
      setBusinessData(data);
    } catch (err) {
      setError("Could not discover business. Please enter details manually.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    discoverBusiness();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 text-brand-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-semibold text-white mb-2">Discovering Your Business</h2>
          <p className="text-ink-400">AI is researching your business profile...</p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Discovery Unavailable</h2>
          <p className="text-ink-400 mb-6">{error}</p>
          <Button onClick={onComplete} className="w-full" size="lg">
            Continue Manually
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Brain className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Business Discovery</h2>
        <p className="text-ink-400 mb-6">AI will research your business and create a profile</p>
        <Button onClick={onComplete} className="w-full" size="lg">
          Start Discovery
        </Button>
      </GlassCard>
    </div>
  );
}

export function ReviewStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Review Your Business</h2>
        <p className="text-ink-400 mb-6">Verify the discovered information</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onComplete} className="flex-1">Confirm</Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function KnowledgeStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <FileText className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Knowledge Upload</h2>
        <p className="text-ink-400 mb-6">Upload documents for AI training</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onComplete} className="flex-1">Continue</Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function IntegrationsStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Link2 className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Connect Apps</h2>
        <p className="text-ink-400 mb-6">Connect your tools (WhatsApp, Gmail, Sheets, etc.)</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onComplete} className="flex-1">Continue</Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function DepartmentsStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Users className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Departments</h2>
        <p className="text-ink-400 mb-6">Select which AI departments to activate</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onComplete} className="flex-1">Continue</Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function TrainingStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Cpu className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">AI Training</h2>
        <p className="text-ink-400 mb-6">Training your AI workforce...</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onComplete} className="flex-1">Complete</Button>
        </div>
      </GlassCard>
    </div>
  );
}

import { AlertCircle } from "lucide-react";