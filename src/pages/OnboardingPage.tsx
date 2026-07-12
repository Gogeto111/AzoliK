"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, CheckCircle2, Zap, Shield, Brain, Users, Zap as ZapIcon,
  FileText, Link2, Cpu, Building2, MapPin, Search, Globe,
  MessageSquare, Briefcase, BarChart3, CreditCard, Settings, UtensilsCrossed,
  Store, HeartPulse, Dumbbell, Wrench, Factory, GraduationCap,
  Truck, Scale, UtensilsCrossed as UtensilsCrossedIcon, Mail, Phone, Smartphone
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
import { TrainingScreen } from "@/components/onboarding/screens/TrainingScreen";
import { db, collection, setDoc, doc as firestoreDoc } from "@/lib/firebase";
import type { OnboardingData } from "@/lib/firebase";

const ONBOARDING_STEPS = [
  { id: "welcome", label: "Welcome", icon: Sparkles },
  { id: "auth", label: "Sign In", icon: Shield },
  { id: "business", label: "Business", icon: Building2 },
  { id: "discovery", label: "Discover", icon: Search },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 },
  { id: "integrations", label: "Connect", icon: Link2 },
  { id: "departments", label: "Departments", icon: Users },
  { id: "knowledge", label: "Knowledge", icon: Brain },
  { id: "training", label: "Training", icon: Cpu },
  { id: "launch", label: "Launch", icon: Zap },
];

export function OnboardingPage() {
  const { user, profile, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});

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

  const persistKnowledge = async (businessId: string, knowledge: Record<string, any>) => {
    if (!knowledge || Object.keys(knowledge).length === 0) return;
    const knowledgeEntries: Array<{ category: string; items: string[] }> = [];
    for (const [category, items] of Object.entries(knowledge)) {
      if (Array.isArray(items) && items.length > 0) {
        knowledgeEntries.push({ category, items: items.filter(Boolean) });
      }
    }
    if (knowledgeEntries.length === 0) return;
    for (const entry of knowledgeEntries) {
      const id = `kb_${entry.category}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await setDoc(firestoreDoc(db, "businesses", businessId, "knowledge", id), {
        id,
        businessId,
        category: entry.category,
        items: entry.items,
        createdAt: Date.now(),
      });
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      const discoveryData = onboardingData.discovery || {};
      const businessInfo = onboardingData.business || {};
      const selectedDepartments: string[] = onboardingData.departments?.departments
        || onboardingData.departments
        || ["support", "sales", "finance"];
      const selectedIntegrations: string[] = onboardingData.integrations?.integrations
        || onboardingData.integrations
        || [];

      const flattenedData: OnboardingData = {
        businessName: discoveryData.name || businessInfo.businessName || "My Business",
        businessType: discoveryData.type || businessInfo.businessType || "other",
        ownerName: profile?.displayName || businessInfo.ownerName || "",
        phone: discoveryData.phone || businessInfo.phone || "",
        address: discoveryData.address || "",
        currency: "INR",
        timezone: "Asia/Kolkata",
        departments: Array.isArray(selectedDepartments) ? selectedDepartments : ["support", "sales", "finance"],
        integrations: Array.isArray(selectedIntegrations) ? selectedIntegrations : [],
      };

      const business = await completeOnboarding(flattenedData);

      if (onboardingData.knowledge && business?.id) {
        await persistKnowledge(business.id, onboardingData.knowledge);
      }

      setCurrentStep("complete");
    } catch (error) {
      console.error("Onboarding failed:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onContinue={() => setCurrentStep("auth")} />;
      case "auth":
        return <AuthPage onComplete={() => setCurrentStep("business")} />;
      case "business":
        return <BusinessInfoScreen onComplete={(data) => handleStepComplete("business", data)} onBack={() => setCurrentStep("auth")} />;
      case "discovery":
        return <AIDiscoveryScreen onComplete={(data) => handleStepComplete("discovery", data)} onBack={() => setCurrentStep("business")} />;
      case "confirm":
        return <ConfirmScreen data={onboardingData.discovery} onComplete={() => setCurrentStep("integrations")} onBack={() => setCurrentStep("discovery")} />;
      case "integrations":
        return <IntegrationsScreen onComplete={(data) => handleStepComplete("integrations", data)} onBack={() => setCurrentStep("confirm")} />;
      case "departments":
        return <DepartmentsScreen onComplete={(data) => handleStepComplete("departments", data)} onBack={() => setCurrentStep("integrations")} />;
      case "knowledge":
        return <KnowledgeScreen onComplete={(data) => handleStepComplete("knowledge", data)} onBack={() => setCurrentStep("departments")} />;
      case "training":
        const trainingDepts = onboardingData.departments?.departments
          || onboardingData.departments
          || ["support", "sales", "finance"];
        return <TrainingScreen departments={Array.isArray(trainingDepts) ? trainingDepts : ["support", "sales", "finance"]} onComplete={() => setCurrentStep("launch")} onBack={() => setCurrentStep("knowledge")} />;
      case "launch":
        const selectedDepartments = onboardingData.departments?.departments
          || onboardingData.departments
          || ["support", "sales", "finance"];
        return <LaunchScreen departments={Array.isArray(selectedDepartments) ? selectedDepartments : ["support", "sales", "finance"]} onComplete={handleCompleteOnboarding} />;
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
                <Button onClick={() => navigate("/dashboard")} className="w-full gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Go to Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
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
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-900 border-b border-white/5">
<motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
            initial={{ width: 0 }}
            animate={{ width: `${ONBOARDING_STEPS.findIndex(s => s.id === currentStep) / (ONBOARDING_STEPS.length - 1) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
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

function ConfirmScreen({ data, onComplete, onBack }: { data: any; onComplete: () => void; onBack: () => void }) {
  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4"
      >
        <GlassCard className="p-8 max-w-md w-full text-center">
          <Search className="h-16 w-16 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Business Discovery</h2>
          <p className="text-ink-400 mb-6">AI is searching public records, maps, and social profiles...</p>
          <Button onClick={onComplete} className="w-full" size="lg">
            Continue
          </Button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950"
    >
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-900 border-b border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-40 bg-ink-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Business Discovery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/30">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      We Found Your Business!
                    </h2>
                    <p className="mt-1 text-sm text-ink-300">
                      Review the information below and confirm to continue.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {data.photos && data.photos.length > 0 && (
                    <div className="space-y-4">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={data.photos[0]}
                          alt={data.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {data.photos.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {data.photos.slice(1, 4).map((photo: string, i: number) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{data.name}</h3>
                      <span className="text-sm text-ink-400 capitalize">{data.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-ink-300">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-white">{data.rating}</span>
                    <span className="text-sm">({data.reviewsCount} reviews)</span>
                  </div>

                  <div className="space-y-2 text-ink-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-ink-400" />
                      <span className="text-sm">{data.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-ink-400" />
                      <span className="text-sm">{data.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-ink-400" />
                      <span className="text-sm">{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-ink-400" />
                      <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-400 hover:underline flex items-center gap-1">
                        {data.website}
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium text-white mb-2">Opening Hours</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(data.hours).map(([day, hours]: [string, any]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-ink-400 capitalize">{day.slice(0, 3)}</span>
                          <span className="text-white font-medium">
                            {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={onBack}
                    className="flex-1 gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Edit Details
                  </Button>
                  <Button
                    onClick={onComplete}
                    className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Yes, This is Correct
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

export default OnboardingPage;