// Onboarding Flow - Question/Answer format
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Globe, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Wrench, 
  Stethoscope, 
  Dumbbell, 
  Sparkles,
  UtensilsCrossed,
  Store,
  Factory,
  Briefcase as BriefcaseIcon,
  HeartPulse,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createBusiness } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const ONBOARDING_QUESTIONS = [
  {
    id: "businessType",
    title: "What type of business do you run?",
    subtitle: "This helps us set up the right departments and workflows for you.",
    icon: Building2,
    type: "select",
    required: true,
    options: [
      { value: "bakery", label: "🍞 Bakery / Cafe", icon: UtensilsCrossed, description: "Cakes, breads, pastries, coffee" },
      { value: "restaurant", label: "🍽️ Restaurant", icon: UtensilsCrossed, description: "Dine-in, takeout, delivery" },
      { value: "retail", label: "🛍️ Retail / E-commerce", icon: Store, description: "Products, inventory, online orders" },
      { value: "clinic", label: "🏥 Clinic / Medical", icon: HeartPulse, description: "Appointments, patients, prescriptions" },
      { value: "gym", label: "💪 Gym / Fitness", icon: Dumbbell, description: "Memberships, classes, trainers" },
      { value: "salon", label: "💇 Salon / Spa", icon: SparklesIcon, description: "Appointments, services, products" },
      { value: "services", label: "🔧 Services / Repairs", icon: Wrench, description: "Field service, maintenance, bookings" },
      { value: "consulting", label: "💼 Consulting / Agency", icon: BriefcaseIcon, description: "Clients, projects, retainers" },
      { value: "factory", label: "🏭 Manufacturing", icon: Factory, description: "Production, inventory, B2B sales" },
      { value: "other", label: "📦 Other", icon: Sparkles, description: "Custom setup for your business" },
    ],
  },
  {
    id: "businessName",
    title: "What's your business name?",
    subtitle: "This will appear on invoices, receipts, and customer communications.",
    icon: Building2,
    type: "text",
    required: true,
    placeholder: "e.g., Butter & Crust Bakery",
  },
  {
    id: "ownerName",
    title: "What's your name?",
    subtitle: "We'll use this for your owner account and communications.",
    icon: User,
    type: "text",
    required: true,
    placeholder: "e.g., Aarish Sharma",
  },
  {
    id: "phone",
    title: "WhatsApp Business number?",
    subtitle: "Customers will message this number. We'll connect it to your Support department.",
    icon: Phone,
    type: "tel",
    required: true,
    placeholder: "+91 98765 43210",
  },
  {
    id: "address",
    title: "Business address?",
    subtitle: "Used for invoices, delivery zones, and local SEO.",
    icon: MapPin,
    type: "textarea",
    required: false,
    placeholder: "123 Baker Street, Bandra West, Mumbai 400050",
  },
  {
    id: "currency",
    title: "Primary currency?",
    subtitle: "All invoices, payments, and reports will use this currency.",
    icon: CreditCard,
    type: "select",
    required: true,
    options: [
      { value: "INR", label: "₹ INR (India)" },
      { value: "USD", label: "$ USD (USA)" },
      { value: "EUR", label: "€ EUR (Europe)" },
      { value: "GBP", label: "£ GBP (UK)" },
    ],
  },
  {
    id: "timezone",
    title: "Timezone?",
    subtitle: "Used for business hours, scheduling, and reports.",
    icon: Globe,
    type: "select",
    required: true,
    options: [
      { value: "Asia/Kolkata", label: "IST (UTC+5:30) - India" },
      { value: "America/New_York", label: "EST (UTC-5) - New York" },
      { value: "America/Los_Angeles", label: "PST (UTC-8) - Los Angeles" },
      { value: "Europe/London", label: "GMT (UTC+0) - London" },
      { value: "Asia/Dubai", label: "GST (UTC+4) - Dubai" },
      { value: "Asia/Singapore", label: "SGT (UTC+8) - Singapore" },
      { value: "Australia/Sydney", label: "AEST (UTC+10) - Sydney" },
    ],
  },
  {
    id: "integrations",
    title: "Which tools do you already use?",
    subtitle: "We'll connect these automatically so your AI departments can use them immediately.",
    icon: Sparkles,
    type: "multiselect",
    required: false,
    options: [
      { value: "razorpay", label: "💳 Razorpay", description: "Indian payments, UPI, cards" },
      { value: "stripe", label: "💳 Stripe", description: "International payments" },
      { value: "google_sheets", label: "📊 Google Sheets", description: "Data, reports, inventory" },
      { value: "google_calendar", label: "📅 Google Calendar", description: "Appointments, bookings" },
      { value: "gmail", label: "📧 Gmail", description: "Emails, invoices, notifications" },
      { value: "shopify", label: "🛍️ Shopify", description: "E-commerce store" },
      { value: "woocommerce", label: "🛒 WooCommerce", description: "WordPress e-commerce" },
      { value: "zoho", label: "📋 Zoho CRM", description: "Leads, deals, contacts" },
      { value: "hubspot", label: "🎯 HubSpot", description: "Marketing, sales, service" },
      { value: "whatsapp", label: "💬 WhatsApp Business", description: "Customer messages" },
      { value: "slack", label: "💬 Slack", description: "Team notifications" },
      { value: "notion", label: "📝 Notion", description: "Docs, SOPs, wiki" },
    ],
  },
  {
    id: "departments",
    title: "Which departments do you want to activate?",
    subtitle: "Each department comes with specialized AI agents, tools, and workflows. You can add more later.",
    icon: Users,
    type: "multiselect",
    required: true,
    options: [
      { value: "support", label: "🎧 Support", description: "Customer messages, FAQs, order tracking, returns", icon: Sparkles },
      { value: "sales", label: "💰 Sales", description: "Leads, quotes, follow-ups, payments, CRM", icon: BriefcaseIcon },
      { value: "marketing", label: "📈 Marketing", description: "Social posts, emails, campaigns, content", icon: SparklesIcon },
      { value: "finance", label: "💸 Finance", description: "Invoices, expenses, reconciliation, reports", icon: CreditCard },
      { value: "operations", label: "⚙️ Operations", description: "Inventory, orders, fulfillment, vendors", icon: Wrench },
      { value: "hr", label: "👥 HR", description: "Hiring, onboarding, team management", icon: Users },
    ],
  },
];

const DEPARTMENT_ICONS: Record<string, any> = {
  support: Sparkles,
  sales: BriefcaseIcon,
  marketing: SparklesIcon,
  finance: CreditCard,
  operations: Wrench,
  hr: Users,
};

export function OnboardingFlow({ onComplete }: { onComplete: (data: any) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = useCallback((value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion.id]);

  const handleNext = useCallback(async () => {
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      return; // Validation handled by UI
    }

    if (currentStep === ONBOARDING_QUESTIONS.length - 1) {
      // Final step - create business
      setSubmitting(true);
      try {
        const { createBusiness } = await import("@/lib/firebase");
        await createBusiness("current-user-id", {
          businessType: answers.businessType,
          businessName: answers.businessName,
          ownerName: answers.ownerName,
          phone: answers.phone,
          address: answers.address,
          currency: answers.currency,
          timezone: answers.timezone,
          integrations: answers.integrations || [],
          departments: answers.departments || [],
        });
        onComplete(answers);
      } catch (error) {
        console.error("Failed to create business:", error);
        alert("Failed to create business. Please try again.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, answers, currentQuestion]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const isLastStep = currentStep === ONBOARDING_QUESTIONS.length - 1;
  const canProceed = currentQuestion.required ? !!answers[currentQuestion.id] : true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-900 border-b border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Azolik</h1>
              <p className="text-xs text-ink-400">Setting up your AI workforce</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">Step {currentStep + 1} of {ONBOARDING_QUESTIONS.length}</p>
            <p className="text-xs text-ink-500">{Math.round(progress)}% complete</p>
          </div>
        </header>

        {/* Question Card */}
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
                {/* Question Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/10",
                    getQuestionIconBg(currentQuestion.id)
                  )}>
                    <currentQuestion.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {currentQuestion.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-300">{currentQuestion.subtitle}</p>
                  </div>
                </div>

                {/* Question Input */}
                <div className="space-y-4">
                  {renderQuestionInput(currentQuestion, answers[currentQuestion.id], (value) => handleAnswer(value))}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed || submitting}
              className={cn(
                "gap-2 w-full sm:w-auto",
                canProceed ? "" : "opacity-50 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up...
                </>
              ) : isLastStep ? (
                <>
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {ONBOARDING_QUESTIONS.map((_, index) => (
              <motion.button
                key={index}
                disabled
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-brand-500 w-8"
                    : "bg-white/10 hover:bg-white/20"
                )}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-xs text-ink-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-brand-400 hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function renderQuestionInput(question: any, value: any, onChange: (value: any) => void) {
  switch (question.type) {
    case "text":
    case "tel":
      return (
        <input
          type={question.type}
          placeholder={question.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
          required={question.required}
        />
      );

    case "textarea":
      return (
        <textarea
          placeholder={question.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all resize-none"
          required={question.required}
        />
      );

    case "select":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none bg-no-repeat bg-right pr-10"
          required={question.required}
        >
          <option value="">Select...</option>
          {question.options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case "multiselect":
      const selected = value || [];
      return (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {question.options.map((opt: any) => {
            const isSelected = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer",
                  isSelected
                    ? "border-brand-400/30 bg-brand-500/10 ring-1 ring-brand-500/20"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onChange(
                    e.target.checked
                      ? [...selected, opt.value]
                      : selected.filter((v: string) => v !== opt.value)
                  )}
                  className="sr-only peer"
                />
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                  isSelected
                    ? "bg-brand-500"
                    : "bg-white/5 border border-white/10 peer-checked:bg-brand-500"
                )}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <opt.icon className="h-5 w-5 text-brand-400" />
                    <span className="font-medium text-white">{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-ink-400 mt-0.5">{opt.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}

function getQuestionIconBg(questionId: string) {
  const colors: Record<string, string> = {
    businessType: "from-amber-500/30 to-amber-700/10",
    businessName: "from-brand-500/30 to-brand-700/10",
    ownerName: "from-emerald-500/30 to-emerald-700/10",
    phone: "from-cyan-500/30 to-cyan-700/10",
    address: "from-rose-500/30 to-rose-700/10",
    currency: "from-amber-500/30 to-amber-700/10",
    timezone: "from-violet-500/30 to-violet-700/10",
    integrations: "from-emerald-500/30 to-emerald-700/10",
    departments: "from-rose-500/30 to-rose-700/10",
  };
  return colors[questionId] || "from-brand-500/30 to-brand-700/10";
}

export { ONBOARDING_QUESTIONS };

export { DiscoveryStep, ReviewStep, KnowledgeStep, IntegrationsStep, DepartmentsStep, TrainingStep } from "./OnboardingSteps";