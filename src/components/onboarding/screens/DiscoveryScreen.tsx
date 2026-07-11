"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, Loader2, AlertCircle, Sparkles, Building2, MapPin, Phone, Mail, CreditCard, Globe, Users, Briefcase, ShoppingBag, Wrench, Stethoscope, Dumbbell, UtensilsCrossed, Store, Factory, HeartPulse, GraduationCap, Truck, Scale } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createBusiness, getBusiness } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface DiscoveryScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const BUSINESS_TYPES = [
  { value: "bakery", label: "Bakery / Cafe", icon: UtensilsCrossed, description: "Cakes, breads, pastries, coffee" },
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed, description: "Dine-in, takeout, delivery" },
  { value: "retail", label: "Retail / E-commerce", icon: Store, description: "Products, inventory, online orders" },
  { value: "clinic", label: "Clinic / Medical", icon: HeartPulse, description: "Appointments, patients, prescriptions" },
  { value: "gym", label: "Gym / Fitness", icon: Dumbbell, description: "Memberships, classes, trainers" },
  { value: "salon", label: "Salon / Spa", icon: Sparkles, description: "Appointments, services, products" },
  { value: "services", label: "Services / Repairs", icon: Wrench, description: "Field service, maintenance, bookings" },
  { value: "consulting", label: "Consulting / Agency", icon: Briefcase, description: "Clients, projects, retainers" },
  { value: "factory", label: "Manufacturing", icon: Factory, description: "Production, inventory, B2B sales" },
  { value: "other", label: "Other", icon: Sparkles, description: "Custom setup for your business" },
];

export function DiscoveryScreen({ onComplete, onBack }: DiscoveryScreenProps) {
  const { user, profile } = useAuth();
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"discover" | "manual" | "confirm">("discover");

  const discoverBusiness = async () => {
    setLoading(true);
    setError(null);
    try {
      const phone = profile?.phoneNumber || user?.phoneNumber;
      if (phone) {
        const response = await fetch(`https://api.azolik.ai/api/business/discover?phone=${encodeURIComponent(phone)}`);
        if (response.ok) {
          const data = await response.json();
          setBusinessData(data);
          setStep("confirm");
          return;
        }
      }
      throw new Error("Discovery unavailable");
    } catch {
      setError("Could not discover business. Please enter details manually.");
      setStep("manual");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    discoverBusiness();
  }, [user, profile]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4"
      >
        <GlassCard className="p-8 max-w-md w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20"
          >
            <Loader2 className="h-7 w-7 text-brand-400 animate-spin" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-2">Discovering Your Business</h2>
          <p className="text-ink-400">AI is researching your business profile...</p>
        </GlassCard>
      </motion.div>
    );
  }

  if (error && step === "manual") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4"
      >
        <GlassCard className="p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Discovery Unavailable</h2>
          <p className="text-ink-400 mb-6">{error}</p>
          <Button onClick={() => setStep("manual")} className="w-full" size="lg">
            Enter Manually
          </Button>
        </GlassCard>
      </motion.div>
    );
  }

  if (step === "confirm" && businessData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                    <Brain className="h-5 w-5 text-white" />
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
                        Found Your Business!
                      </h2>
                      <p className="mt-1 text-sm text-ink-300">
                        Review the information below and confirm to continue.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-brand-400" />
                        Business Details
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div>
                          <p className="text-ink-400">Name</p>
                          <p className="font-medium text-white">{businessData.name || "Not found"}</p>
                        </div>
                        <div>
                          <p className="text-ink-400">Type</p>
                          <p className="font-medium text-white capitalize">{businessData.type || "Not found"}</p>
                        </div>
                        <div>
                          <p className="text-ink-400">Phone</p>
                          <p className="font-medium text-white">{businessData.phone || "Not found"}</p>
                        </div>
                        <div>
                          <p className="text-ink-400">Address</p>
                          <p className="font-medium text-white">{businessData.address || "Not found"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={onBack} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={onComplete} className="flex-1" size="lg">
                      Confirm & Continue
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4"
    >
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Brain className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Business Discovery</h2>
        <p className="text-ink-400 mb-6">AI will research your business and create a profile</p>
        <Button onClick={discoverBusiness} className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Discovering...
            </>
          ) : (
            "Start Discovery"
          )}
        </Button>
      </GlassCard>
    </motion.div>
  );
}

export default DiscoveryScreen;