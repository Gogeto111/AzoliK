// OnboardingPage - Main orchestrator for the complete onboarding flow
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
} from "lucide-react";
import { LandingPage } from "./LandingPage";
import { AuthPage } from "./AuthPage";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_STEPS = [
  { id: "landing", label: "Welcome", icon: Sparkles },
  { id: "auth", label: "Sign In", icon: Shield },
  { id: "discovery", label: "Discover", icon: Brain },
  { id: "review", label: "Review", icon: CheckCircle2 },
  { id: "knowledge", label: "Knowledge", icon: Sparkles },
  { id: "integrations", label: "Connect", icon: Zap },
  { id: "departments", label: "Departments", icon: Users },
  { id: "training", label: "Train", icon: Zap },
];

export function OnboardingPage() {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<string>("landing");

  // Auto-advance if user already exists
  useEffect(() => {
    if (user && currentStep === "landing") {
      setCurrentStep("auth");
    }
  }, [user, currentStep]);

  // Determine which step to render
  const renderStep = () => {
    switch (currentStep) {
      case "landing":
        return <LandingPage onGetStarted={() => setCurrentStep("auth")} />;
      case "auth":
        return <AuthPage onComplete={() => setCurrentStep("discovery")} />;
      case "discovery":
        return <DiscoveryStep onComplete={() => setCurrentStep("review")} onBack={() => setCurrentStep("auth")} />;
      case "review":
        return <ReviewStep onComplete={() => setCurrentStep("knowledge")} onBack={() => setCurrentStep("discovery")} />;
      case "knowledge":
        return <KnowledgeStep onComplete={() => setCurrentStep("integrations")} onBack={() => setCurrentStep("review")} />;
      case "integrations":
        return <IntegrationsStep onComplete={() => setCurrentStep("departments")} onBack={() => setCurrentStep("knowledge")} />;
      case "departments":
        return <DepartmentsStep onComplete={() => setCurrentStep("training")} onBack={() => setCurrentStep("integrations")} />;
      case "training":
        return <TrainingStep onComplete={() => setCurrentStep("complete")} onBack={() => setCurrentStep("departments")} />;
      case "complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4"
          >
            <GlassCard className="p-8 max-w-md w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 ring-1 ring-inset ring-white/10"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </motion.div>
              
              <h2 className="text-2xl font-semibold text-white mb-2">
                Your AI Workforce is Ready!
              </h2>
              <p className="text-ink-400 mb-6 max-w-sm mx-auto">
                All departments are online and your AI agents are ready to work. 
                Your business now runs on autopilot.
              </p>
              
              <div className="space-y-3">
                <Button onClick={() => window.location.href = "/dashboard"} className="w-full gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Go to Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setCurrentStep("landing")} className="w-full">
                  Back to Home
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        );
      default:
        return <LandingPage onGetStarted={() => setCurrentStep("auth")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950">
      {/* Progress Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-900 border-b border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
          initial={{ width: 0 }}
          animate={{ width: `${ONBOARDING_STEPS.findIndex(s => s.id === currentStep) / (ONBOARDING_STEPS.length - 1) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Step Indicator Header */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-ink-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Azolik Setup</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-400">Step {ONBOARDING_STEPS.findIndex(s => s.id === currentStep) + 1} of {ONBOARDING_STEPS.length}</p>
              </div>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {ONBOARDING_STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = ["landing", "auth", "discovery", "review", "knowledge", "integrations", "departments", "training"].indexOf(step.id) < ["landing", "auth", "discovery", "review", "knowledge", "integrations", "departments", "training"].indexOf(currentStep);
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ring-white/15 transition-all",
                        currentStep === step.id && "bg-brand-500/30 ring-brand-500/30",
                        isCompleted && "bg-emerald-500/20 ring-emerald-500/30",
                        !isActive && !isCompleted && "bg-white/[0.02] ring-white/5"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <step.icon className={cn("h-5 w-5", isActive ? "text-brand-300" : isCompleted ? "text-emerald-400" : "text-ink-400")} />
                      )}
                    </motion.div>
                    <span className="mt-1 text-[10px] font-medium text-center truncate w-20">
                      {currentStep === step.id ? step.label : ""}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ONBOARDING_STEPS.findIndex(s => s.id === currentStep) / (ONBOARDING_STEPS.length - 1) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 h-1 bg-ink-900 rounded-full overflow-hidden"
            >
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-300" />
            </motion.div>
          </div>
        </div>

        <div className="flex-1">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;

// Placeholder step components (inline to avoid missing module errors)
function BusinessDiscovery({ onComplete }: { onComplete: () => void }) {
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

function BusinessReview({ data, onConfirm, onBack }: { data: any; onConfirm: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Review Your Business</h2>
        <p className="text-ink-400 mb-6">Verify the discovered information</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onConfirm} className="flex-1">Confirm</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function KnowledgeUpload({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <FileText className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Knowledge Upload</h2>
        <p className="text-ink-400 mb-6">Upload documents for AI training</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSkip} className="flex-1">Skip</Button>
          <Button onClick={onComplete} className="flex-1">Continue</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function ConnectApps({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Link2 className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Connect Apps</h2>
        <p className="text-ink-400 mb-6">Connect your tools (WhatsApp, Gmail, Sheets, etc.)</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSkip} className="flex-1">Skip</Button>
          <Button onClick={onComplete} className="flex-1">Continue</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function DepartmentGenerator({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Users className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Departments</h2>
        <p className="text-ink-400 mb-6">Select which AI departments to activate</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSkip} className="flex-1">Skip</Button>
          <Button onClick={onComplete} className="flex-1">Continue</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function AITraining({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Cpu className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">AI Training</h2>
        <p className="text-ink-400 mb-6">Training your AI workforce...</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSkip} className="flex-1">Skip</Button>
          <Button onClick={onComplete} className="flex-1">Complete</Button>
        </div>
      </GlassCard>
    </div>
  );
}