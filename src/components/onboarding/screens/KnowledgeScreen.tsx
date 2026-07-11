"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Utensils, Wrench, FileText, CreditCard, Zap, ArrowLeft, ArrowRight, 
  Check, Plus, Minus, Sparkles, Image, Upload, X, Tag, Database, HelpCircle,
  RefreshCw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface KnowledgeScreenProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const KNOWLEDGE_CATEGORIES = [
  {
    id: "products",
    title: "Products",
    subtitle: "What do you sell?",
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    placeholder: "e.g., Chocolate Cake, Sourdough Bread, Croissants",
    examples: ["Chocolate Cake", "Sourdough Bread", "Croissants", "Coffee Beans", "Custom Cakes"],
    description: "Each product with price and description helps AI answer customer questions",
  },
  {
    id: "services",
    title: "Services",
    subtitle: "What services do you provide?",
    icon: Utensils,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    placeholder: "e.g., Custom Cakes, Catering, Coffee Bar",
    examples: ["Custom Cakes", "Catering", "Coffee Bar", "Gift Boxes", "Baking Classes"],
    description: "Services with duration and pricing help AI book appointments",
  },
  {
    id: "faqs",
    title: "FAQs",
    subtitle: "What do customers ask most?",
    icon: HelpCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    placeholder: "e.g., What are your hours? Do you deliver?",
    examples: [
      "What are your opening hours?",
      "Do you offer delivery?",
      "Can I order custom cakes?",
      "What's your refund policy?",
      "Do you have gluten-free options?"
    ],
    description: "Top questions let AI answer instantly without human intervention",
  },
  {
    id: "inventory",
    title: "Inventory",
    subtitle: "How do you manage stock?",
    icon: Database,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    placeholder: "Not tracked / Google Sheets / POS / Manual count",
    examples: ["Google Sheets", "Excel", "POS System", "Manual Notebook", "Not Tracked"],
    description: "Knowing your inventory system helps AI track stock and prevent overselling",
  },
  {
    id: "payments",
    title: "Payments",
    subtitle: "How do customers pay?",
    icon: CreditCard,
    color: "text-rose-400",
    bg: "bg-rose-500/20",
    placeholder: "Select all that apply",
    examples: ["UPI", "Cash", "Card", "Stripe", "Razorpay", "PayPal"],
    description: "Payment methods connect to your Finance department for auto-reconciliation",
    isMultiselect: true,
  },
];

export function KnowledgeScreen({ onComplete, onBack }: KnowledgeScreenProps) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [knowledge, setKnowledge] = useState<Record<string, any>>({});

  const progress = ((currentCategory + 1) / KNOWLEDGE_CATEGORIES.length) * 100;
  const category = KNOWLEDGE_CATEGORIES[currentCategory];
  const value = knowledge[category.id] || [];

  const handleAddItem = () => {
    const newItems = [...value, ""];
    setKnowledge(prev => ({ ...prev, [category.id]: newItems }));
  };

  const handleUpdateItem = (index: number, text: string) => {
    const newItems = [...value];
    newItems[index] = text;
    setKnowledge(prev => ({ ...prev, [category.id]: newItems }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = value.filter((_: string, i: number) => i !== index);
    setKnowledge(prev => ({ ...prev, [category.id]: newItems }));
  };

  const handleSelect = (item: string) => {
    if (category.isMultiselect) {
      const selected = value.includes(item) ? value.filter((i: string) => i !== item) : [...value, item];
      setKnowledge(prev => ({ ...prev, [category.id]: selected }));
    } else {
      // For payments, we use the multiselect approach
    }
  };

  const isComplete = value.length > 0;

  const handleNext = () => {
    if (currentCategory === KNOWLEDGE_CATEGORIES.length - 1) {
      onComplete(knowledge);
    } else {
      setCurrentCategory(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentCategory === 0) {
      onBack();
    } else {
      setCurrentCategory(prev => prev - 1);
    }
  };

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
              <p className="text-xs text-ink-400">Build your knowledge base</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">Step {currentCategory + 1} of {KNOWLEDGE_CATEGORIES.length}</p>
            <p className="text-xs text-ink-500">{Math.round(progress)}% complete</p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/10", category.bg)}>
                    <category.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {category.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-300">{category.subtitle}</p>
                  </div>
                </div>

                <p className="mb-6 text-sm text-ink-400">{category.description}</p>

                {category.isMultiselect ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {category.examples.map((option) => {
                      const selected = value.includes(option);
                      return (
                        <label
                          key={option}
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
                            onChange={() => handleSelect(option)}
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
                          <span className="font-medium text-white">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {value.map((item: string, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateItem(index, e.target.value)}
                            placeholder={category.placeholder}
                            className="flex-1 rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                          />
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      onClick={handleAddItem}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Another
                    </Button>

                    {category.examples.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-ink-500">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                          {category.examples.map((example) => (
                            <button
                              key={example}
                              onClick={() => {
                                if (!value.includes(example)) {
                                  handleAddItem();
                                  const newItems = [...value, example];
                                  setKnowledge(prev => ({ ...prev, [category.id]: newItems }));
                                }
                              }}
                              disabled={value.includes(example)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                value.includes(example)
                                  ? "bg-brand-500/20 text-brand-300 cursor-not-allowed"
                                  : "bg-white/5 text-ink-300 hover:bg-white/10"
                              )}
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentCategory === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              disabled={!isComplete}
              className={cn(
                "gap-2 w-full sm:w-auto",
                isComplete ? "" : "opacity-50 cursor-not-allowed"
              )}
            >
              {currentCategory === KNOWLEDGE_CATEGORIES.length - 1 ? (
                <>
                  Complete Setup
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
            {KNOWLEDGE_CATEGORIES.map((_, index) => (
              <motion.button
                key={index}
                disabled
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentCategory
                    ? "bg-brand-500 w-8"
                    : index < currentCategory
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

export default KnowledgeScreen;