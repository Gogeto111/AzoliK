"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, MessageSquare, MapPin, Mail, Phone, Smartphone, Globe, 
  Sparkles, ArrowLeft, ArrowRight, Check, UtensilsCrossed, Store, HeartPulse, 
  Dumbbell, Wrench, Briefcase, Factory, Star, AlertCircle, X, ExternalLink 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createBusiness, getBusiness } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface AIDiscoveryScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

type DiscoveryStage = "discovering" | "found" | "manual" | "error";

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

export function AIDiscoveryScreen({ onComplete, onBack }: AIDiscoveryScreenProps) {
  const { user, profile } = useAuth();
  const [stage, setStage] = useState<DiscoveryStage>("discovering");
  const [businessData, setBusinessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const discoverBusiness = async () => {
    try {
      const phone = profile?.phoneNumber || user?.phoneNumber;
      if (phone) {
        const response = await fetch(`https://api.azolik.ai/api/business/discover?phone=${encodeURIComponent(phone)}`);
        if (response.ok) {
          const data = await response.json();
          setBusinessData(data);
          setStage("found");
          return;
        }
      }
      throw new Error("Discovery unavailable");
    } catch {
      setError("Could not discover business. Please enter details manually.");
      setStage("error");
    }
  };

  useEffect(() => {
    discoverBusiness();
  }, [user, profile]);

  const handleConfirm = () => {
    if (businessData) {
      setStage("found");
      onComplete();
    }
  };

  const handleEdit = () => {
    setStage("manual");
  };

  if (stage === "discovering") {
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
            <svg className="h-7 w-7 text-brand-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-2">Discovering Your Business</h2>
          <p className="text-ink-400">AI is searching public records, maps, and social profiles...</p>
        </GlassCard>
      </motion.div>
    );
  }

  if (stage === "error") {
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
          <Button onClick={() => setStage("manual")} className="w-full" size="lg">
            Enter Manually
          </Button>
        </GlassCard>
      </motion.div>
    );
  }

  if (stage === "found" && businessData) {
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
                      <Check className="h-7 w-7 text-emerald-400" />
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
                    {businessData.photos && businessData.photos.length > 0 && (
                      <div className="space-y-4">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white/5">
                          <img
                            src={businessData.photos[0]}
                            alt={businessData.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {businessData.photos.length > 1 && (
                          <div className="grid grid-cols-3 gap-2">
                            {businessData.photos.slice(1, 4).map((photo: string, i: number) => (
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
                        <h3 className="text-xl font-semibold text-white">{businessData.name}</h3>
                        <span className="text-sm text-ink-400 capitalize">{businessData.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-ink-300">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-white">{businessData.rating}</span>
                      <span className="text-sm">({businessData.reviewsCount} reviews)</span>
                    </div>

                    <div className="space-y-2 text-ink-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-ink-400" />
                        <span className="text-sm">{businessData.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-ink-400" />
                        <span className="text-sm">{businessData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-ink-400" />
                        <span className="text-sm">{businessData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-ink-400" />
                        <a href={businessData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-400 hover:underline flex items-center gap-1">
                          {businessData.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="font-medium text-white mb-2">Opening Hours</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(businessData.hours).map(([day, hours]: [string, any]) => (
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
                      onClick={handleEdit}
                      className="flex-1 gap-2"
                    >
                      <X className="h-4 w-4" />
                      Edit Details
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600"
                    >
                      <Check className="h-4 w-4" />
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

  // Manual entry fallback
  const currentStage = stage as DiscoveryStage;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 flex items-center justify-center p-4"
    >
      <GlassCard className="p-8 max-w-md w-full text-center">
        <Building2 className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Business Discovery</h2>
        <p className="text-ink-400 mb-6">AI will research your business and create a profile</p>
        <Button onClick={discoverBusiness} className="w-full" size="lg" disabled={currentStage === "discovering"}>
          {currentStage === "discovering" ? (
            <>
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
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

export default AIDiscoveryScreen;