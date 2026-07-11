"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Brain, 
  Users, 
  Zap as ZapIcon,
  FileText,
  Link2,
  Cpu,
} from "lucide-react";
import { LandingPage } from "./LandingPage";
import { AuthPage } from "./AuthPage";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeScreen } from "@/components/onboarding/screens/WelcomeScreen";
import { BusinessInfoScreen } from "@/components/onboarding/screens/BusinessInfoScreen";
import { AIDiscoveryScreen } from "@/components/onboarding/screens/AIDiscoveryScreen";
import { KnowledgeScreen } from "@/components/onboarding/screens/KnowledgeScreen";
import { IntegrationsScreen } from "@/components/onboarding/screens/IntegrationsScreen";
import { DepartmentsScreen } from "@/components/onboarding/screens/DepartmentsScreen";
import { LaunchScreen } from "@/components/onboarding/screens/LaunchScreen";

const ONBOARDING_STEPS = [
  { id: "welcome", label: "Welcome", icon: Sparkles },
  { id: "auth", label: "Sign In", icon: Shield },
  { id: "business", label: "Business", icon: Brain },
  { id: "discovery", label: "Discover", icon: Zap },
  { id: "knowledge", label: "Knowledge", icon: FileText },
  { id: "integrations", label: "Connect", icon: Link2 },
  { id: "departments", label: "Departments", icon: Users },
  { id: "launch", label: "Launch", icon: Cpu },
];

export function OnboardingPage() {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});

  // Auto-advance if user already exists
  useEffect(() => {
    if (user && currentStep === "welcome") {
      setCurrentStep("auth");
    }
  }, [user, currentStep]);

  const handleStepComplete = useCallback((stepId: string, data?: any) => {
    if (data) {
      setOnboardingData(prev => ({ ...prev, [stepId]: data }));
    }
    
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
    const nextStep = ONBOARDING_STEPS[currentIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  }, []);

  const handleStepBack = useCallback((stepId: string) => {
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
    const prevStep = ONBOARDING_STEPS[currentIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onContinue={() => setCurrentStep("auth")} />;
      case "auth":
        return <AuthPage onComplete={() => setCurrentStep("business")} />;
      case "business":
        return <BusinessInfoScreen onComplete={() => setCurrentStep("discovery")} onBack={() => setCurrentStep("auth")} />;
      case "discovery":
        return <AIDiscoveryScreen onComplete={() => handleStepComplete("discovery")} onBack={() => setCurrentStep("business")} />;
      case "knowledge":
        return <KnowledgeScreen onComplete={(data) => handleStepComplete("knowledge", data)} onBack={() => setCurrentStep("discovery")} />;
      case "integrations":
        return <IntegrationsScreen onComplete={(data) => handleStepComplete("integrations", data)} onBack={() => setCurrentStep("knowledge")} />;
      case "departments":
        return <DepartmentsScreen onComplete={(data) => handleStepComplete("departments", data)} onBack={() => setCurrentStep("integrations")} />;
      case "launch":
        const selectedDepartments = onboardingData.departments?.departments || ["support", "sales", "finance"];
        return <LaunchScreen departments={selectedDepartments} onComplete={() => setCurrentStep("complete")} />;
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
                <Button variant="ghost" onClick={() => setCurrentStep("welcome")} className="w-full">
                  Back to Home
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        );
      default:
        return <WelcomeScreen onContinue={() => setCurrentStep("auth")} />;
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
                const isCompleted = ONBOARDING_STEPS.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ring-white/15 transition-all",
                        isActive && "bg-brand-500/30 ring-brand-500/30",
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
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;