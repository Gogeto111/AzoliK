"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, MessageSquare, MapPin, Mail, Phone, Smartphone, Globe, Sparkles, ArrowLeft, ArrowRight, Check, UtensilsCrossed, Store, HeartPulse, Dumbbell, Wrench, Briefcase, Factory, GraduationCap, Truck, Scale, Sparkles as SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface BusinessInfoScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const BUSINESS_TYPES = [
  { value: "bakery", label: "Bakery / Cafe", icon: UtensilsCrossed, description: "Cakes, breads, pastries, coffee" },
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed, description: "Dine-in, takeout, delivery" },
  { value: "retail", label: "Retail / E-commerce", icon: Store, description: "Products, inventory, online orders" },
  { value: "clinic", label: "Clinic / Medical", icon: HeartPulse, description: "Appointments, patients, prescriptions" },
  { value: "gym", label: "Gym / Fitness", icon: Dumbbell, description: "Memberships, classes, trainers" },
  { value: "salon", label: "Salon / Spa", icon: SparklesIcon, description: "Appointments, services, products" },
  { value: "services", label: "Services / Repairs", icon: Wrench, description: "Field service, maintenance, bookings" },
  { value: "consulting", label: "Consulting / Agency", icon: Briefcase, description: "Clients, projects, retainers" },
  { value: "factory", label: "Manufacturing", icon: Factory, description: "Production, inventory, B2B sales" },
  { value: "other", label: "Other", icon: Sparkles, description: "Custom setup for your business" },
];

const EMPLOYEE_RANGES = [
  { value: "solo", label: "Just me", description: "Solo founder/owner" },
  { value: "small", label: "2-5 employees", description: "Small team" },
  { value: "medium", label: "5-20 employees", description: "Growing business" },
  { value: "large", label: "20-50 employees", description: "Established company" },
  { value: "enterprise", label: "50+ employees", description: "Large organization" },
];

const CONTACT_CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/20" },
  { value: "instagram", label: "Instagram", icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/20" },
  { value: "facebook", label: "Facebook", icon: Globe, color: "text-blue-400", bg: "bg-blue-500/20" },
  { value: "website", label: "Website", icon: Smartphone, color: "text-purple-400", bg: "bg-purple-500/20" },
  { value: "phone", label: "Phone", icon: Phone, color: "text-amber-400", bg: "bg-amber-500/20" },
  { value: "email", label: "Email", icon: Mail, color: "text-red-400", bg: "bg-red-500/20" },
  { value: "walkin", label: "Walk-ins", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20" },
];

export function BusinessInfoScreen({ onComplete, onBack }: BusinessInfoScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    businessName: "",
    businessType: "",
    employees: "",
    contactChannels: [],
  });

  const progress = ((step + 1) / 4) * 100;

  const currentQuestion = [
    {
      id: "businessName",
      title: "What's your business name?",
      subtitle: "This will appear on invoices, receipts, and customer communications.",
      icon: Building2,
      type: "text",
      required: true,
      placeholder: "e.g., The Corner Bakery",
    },
    {
      id: "businessType",
      title: "What type of business do you run?",
      subtitle: "This helps us set up the right departments and workflows.",
      icon: Sparkles,
      type: "select",
      required: true,
      options: BUSINESS_TYPES,
    },
    {
      id: "employees",
      title: "How many people work with you?",
      subtitle: "Including yourself - this helps us scale your AI workforce.",
      icon: Users,
      type: "select",
      required: true,
      options: EMPLOYEE_RANGES,
    },
    {
      id: "contactChannels",
      title: "How do customers reach you?",
      subtitle: "Select all that apply - we'll connect these channels to your AI departments.",
      icon: MessageSquare,
      type: "multiselect",
      required: false,
      options: CONTACT_CHANNELS,
    },
  ][step];

  const handleAnswer = useCallback((value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion.id]);

  const handleNext = useCallback(() => {
    if (currentQuestion.required && !answers[currentQuestion.id]) return;
    if (step === 3) {
      onComplete();
    } else {
      setStep(prev => prev + 1);
    }
  }, [step, answers, currentQuestion, onComplete]);

  const handleBack = useCallback(() => {
    if (step === 0) {
      onBack();
    } else {
      setStep(prev => prev - 1);
    }
  }, [step, onBack]);

  const canProceed = currentQuestion.required ? !!answers[currentQuestion.id] : true;

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
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Azolik</h1>
              <p className="text-xs text-ink-400">Tell us about your business</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">Step {step + 1} of 4</p>
            <p className="text-xs text-ink-500">{Math.round(progress)}% complete</p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/10 bg-brand-500/20">
                    <currentQuestion.icon className="h-7 w-7 text-brand-400" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {currentQuestion.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-300">{currentQuestion.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentQuestion.type === "text" && (
                    <input
                      type="text"
                      placeholder={currentQuestion.placeholder}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                      required={currentQuestion.required}
                      autoFocus
                    />
                  )}

                  {currentQuestion.type === "select" && (
                    <select
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none bg-no-repeat bg-right pr-10"
                      required={currentQuestion.required}
                    >
                      <option value="">Select...</option>
                      {currentQuestion.options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}

                  {currentQuestion.type === "multiselect" && (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {currentQuestion.options.map((opt: any) => {
                        const selected = answers[currentQuestion.id]?.includes(opt.value) || false;
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer",
                              selected
                                ? "border-brand-400/30 bg-brand-500/10 ring-1 ring-brand-500/20"
                                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => handleAnswer(
                                e.target.checked
                                  ? [...(answers[currentQuestion.id] || []), opt.value]
                                  : (answers[currentQuestion.id] || []).filter((v: string) => v !== opt.value)
                              )}
                              className="sr-only peer"
                            />
                            <div className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                              selected
                                ? "bg-brand-500"
                                : "bg-white/5 border border-white/10 peer-checked:bg-brand-500"
                            )}>
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <opt.icon className={`h-5 w-5 ${opt.color}`} />
                                <span className="font-medium text-white">{opt.label}</span>
                              </div>
                              <p className="text-[11px] text-ink-400 mt-0.5">{opt.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                "gap-2 w-full sm:w-auto",
                canProceed ? "" : "opacity-50 cursor-not-allowed"
              )}
            >
              {step === 3 ? (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.button
                key={index}
                disabled
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === step
                    ? "bg-brand-500 w-8"
                    : index < step
                    ? "bg-emerald-400"
                    : "bg-white/10"
                )}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </main>
      </div>
    </motion.div>
  );
}

export default BusinessInfoScreen;