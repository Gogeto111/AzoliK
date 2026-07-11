"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Mail, Database, Link2, Globe, MessageSquare, ShoppingBag, 
  Factory, FileText, Smartphone, Zap, ArrowLeft, ArrowRight, Check, 
  Loader2, Sparkles, Shield, Cloud, Cpu, Wifi, HardDrive, Users,
  Settings, BarChart3, Bell, Heart, Star, Package, Truck, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface IntegrationsScreenProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const INTEGRATION_CATEGORIES = [
  {
    id: "communication",
    title: "Communication",
    icon: MessageSquare,
    color: "text-green-400",
    bg: "bg-green-500/20",
    integrations: [
      { id: "whatsapp", name: "WhatsApp Business", description: "Customer messaging & support", icon: MessageSquare, status: "available" },
      { id: "gmail", name: "Gmail", description: "Email automation & invoices", icon: Mail, status: "available" },
      { id: "instagram", name: "Instagram DM", description: "Social media messages", icon: Heart, status: "available" },
      { id: "facebook", name: "Facebook Messenger", description: "Social media messages", icon: Users, status: "available" },
      { id: "slack", name: "Slack", description: "Team notifications", icon: Database, status: "available" },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    integrations: [
      { id: "razorpay", name: "Razorpay", description: "UPI, Cards, Netbanking (India)", icon: CreditCard, status: "available" },
      { id: "stripe", name: "Stripe", description: "International payments", icon: CreditCard, status: "available" },
      { id: "paypal", name: "PayPal", description: "Global payments", icon: CreditCard, status: "available" },
    ],
  },
  {
    id: "productivity",
    title: "Productivity",
    icon: BarChart3,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    integrations: [
      { id: "google_sheets", name: "Google Sheets", description: "Data, reports, inventory sync", icon: Database, status: "available" },
      { id: "google_calendar", name: "Google Calendar", description: "Appointments & scheduling", icon: Calendar, status: "available" },
      { id: "google_drive", name: "Google Drive", description: "File storage & sharing", icon: HardDrive, status: "available" },
      { id: "notion", name: "Notion", description: "Docs, SOPs, wiki", icon: FileText, status: "available" },
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    icon: ShoppingBag,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    integrations: [
      { id: "shopify", name: "Shopify", description: "Online store & orders", icon: ShoppingBag, status: "available" },
      { id: "woocommerce", name: "WooCommerce", description: "WordPress e-commerce", icon: ShoppingBag, status: "available" },
    ],
  },
  {
    id: "crm",
    title: "CRM & Marketing",
    icon: Users,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
    integrations: [
      { id: "hubspot", name: "HubSpot", description: "Marketing, sales, service", icon: BarChart3, status: "available" },
      { id: "zoho", name: "Zoho CRM", description: "Leads, deals, contacts", icon: Users, status: "available" },
    ],
  },
];

export function IntegrationsScreen({ onComplete, onBack }: IntegrationsScreenProps) {
  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [showConnected, setShowConnected] = useState(false);

  const progress = ((currentCategory + 1) / INTEGRATION_CATEGORIES.length) * 100;
  const category = INTEGRATION_CATEGORIES[currentCategory];
  const connectedCount = Object.values(connectedIntegrations).filter(Boolean).length;

  const toggleIntegration = async (id: string) => {
    if (connecting) return;
    setConnecting(id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectedIntegrations(prev => ({ ...prev, [id]: !prev[id] }));
    setConnecting(null);
  };

  const handleNext = () => {
    if (currentCategory === INTEGRATION_CATEGORIES.length - 1) {
      const selected = Object.entries(connectedIntegrations)
        .filter(([_, connected]) => connected)
        .map(([id]) => id);
      onComplete({ integrations: selected });
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

  const handleSkip = () => {
    if (currentCategory === INTEGRATION_CATEGORIES.length - 1) {
      onComplete({ integrations: [] });
    } else {
      setCurrentCategory(prev => prev + 1);
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
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Azolik</h1>
              <p className="text-xs text-ink-400">Connect your tools</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">Step {currentCategory + 1} of {INTEGRATION_CATEGORIES.length}</p>
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
              className="w-full max-w-4xl"
            >
              <GlassCard className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/10", category.bg)}>
                      <category.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        {category.title}
                      </h2>
                      <p className="mt-1 text-sm text-ink-300">
                        Connect the tools you already use. Your AI departments will work with them automatically.
                      </p>
                    </div>
                  </div>
                  {connectedCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {connectedCount} connected
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3">
                  {category.integrations.map((integration) => {
                    const isConnected = connectedIntegrations[integration.id];
                    return (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all group",
                          isConnected
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-brand-500/20 hover:bg-brand-500/5"
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                            isConnected ? "bg-emerald-500/20" : category.bg
                          )}>
                            <integration.icon className={cn("h-6 w-6", isConnected ? "text-emerald-400" : category.color)} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-white truncate">{integration.name}</h3>
                            <p className="text-sm text-ink-400 truncate">{integration.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isConnected ? (
                            <div className="flex items-center gap-2 text-emerald-400">
                              <Check className="h-4 w-4" />
                              <span className="text-sm font-medium">Connected</span>
                            </div>
                          ) : connecting === integration.id ? (
                            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => toggleIntegration(integration.id)}
                              className="gap-2 bg-brand-500/20 hover:bg-brand-500/30 border-brand-500/30"
                            >
                              <Link2 className="h-4 w-4" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {connectedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">AI will auto-sync data from connected tools</span>
                    </div>
                    <p className="text-sm text-ink-400">
                      Your departments will have real-time access to orders, customers, inventory, and conversations.
                    </p>
                  </motion.div>
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

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="gap-2"
              >
                Skip
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                className="gap-2"
              >
                {currentCategory === INTEGRATION_CATEGORIES.length - 1 ? (
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
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {INTEGRATION_CATEGORIES.map((_, index) => (
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

export default IntegrationsScreen;