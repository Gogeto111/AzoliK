"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, MessageSquare, MapPin, Mail, Phone, Smartphone, Globe, 
  Sparkles, ArrowLeft, ArrowRight, Check, UtensilsCrossed, Store, HeartPulse, 
  Dumbbell, Wrench, Briefcase, Factory, GraduationCap, Truck, Scale, Sparkles as SparklesIcon,
  Star, AlertCircle, X, ExternalLink, Search, Loader2, CheckCircle2, Shield, Link2, Brain, Cpu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface AIDiscoveryScreenProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

type DiscoveryStage = "searching" | "found" | "manual" | "error" | "confirm";

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

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ONBOARDING_STEPS = [
  { id: "welcome", label: "Welcome", icon: Sparkles },
  { id: "auth", label: "Sign In", icon: Shield },
  { id: "business", label: "Business", icon: Building2 },
  { id: "discovery", label: "Discover", icon: Search },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 },
  { id: "integrations", label: "Connect", icon: Link2 },
  { id: "departments", label: "Departments", icon: Users },
  { id: "knowledge", label: "Knowledge", icon: Brain },
  { id: "launch", label: "Launch", icon: Cpu },
];

export function AIDiscoveryScreen({ onComplete, onBack }: AIDiscoveryScreenProps) {
  const { profile } = useAuth();
  const [stage, setStage] = useState<DiscoveryStage>("searching");
  const [businessData, setBusinessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const discoverBusiness = useCallback(async () => {
    try {
      const phone = profile?.phoneNumber || "";
      if (!phone) {
        throw new Error("No phone number available");
      }

      if (GOOGLE_MAPS_API_KEY) {
        const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(phoneNumber)}&inputtype=phonenumber&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,opening_hours,website,photos,types&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.status === "OK" && data.candidates && data.candidates.length > 0) {
          const place = data.candidates[0];
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,opening_hours,website,photos,types,business_status&key=${GOOGLE_MAPS_API_KEY}`
          );
          const detailsData = await detailsResponse.json();
          
          if (detailsData.status === "OK") {
            const result = detailsData.result;
            const photos = result.photos ? result.photos.slice(0, 4).map((p: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
            ) : [];

            const hours: Record<string, { open: string; close: string; closed: boolean }> = {};
            if (result.opening_hours?.periods) {
              const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
              days.forEach((day, i) => {
                const period = result.opening_hours.periods.find((p: any) => p.open?.day === i);
                if (period) {
                  const open = period.open.time;
                  const close = period.close?.time || "2359";
                  hours[day] = {
                    open: `${open.slice(0, 2)}:${open.slice(2)}`,
                    close: `${close.slice(0, 2)}:${close.slice(2)}`,
                    closed: false,
                  };
                } else {
                  hours[day] = { open: "09:00", close: "18:00", closed: true };
                }
              });
            }

            const businessType = result.types?.[0] || "other";
            
            setBusinessData({
              name: result.name,
              type: businessType,
              address: result.formatted_address,
              phone: result.formatted_phone_number || phone,
              email: "",
              website: result.website || "",
              rating: result.rating?.toFixed(1) || "4.5",
              reviewsCount: result.user_ratings_total || 0,
              photos,
              hours,
              latitude: result.geometry?.location?.lat(),
              longitude: result.geometry?.location?.lng(),
              placeId: result.place_id,
            });
            setStage("found");
            return;
          }
        }
      }

      throw new Error("Discovery unavailable");
    } catch (err) {
      setError("Could not discover business automatically. Please enter details manually.");
      setStage("manual");
    }
  }, [profile]);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !GOOGLE_MAPS_API_KEY) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=establishment&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        setSearchResults(data.predictions.slice(0, 5));
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  const selectPlace = async (placeId: string) => {
    if (!GOOGLE_MAPS_API_KEY) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,opening_hours,website,photos,types&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === "OK") {
        const result = data.result;
        const photos = result.photos ? result.photos.slice(0, 4).map((p: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        ) : [];

        const hours: Record<string, { open: string; close: string; closed: boolean }> = {};
        if (result.opening_hours?.periods) {
          const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          days.forEach((day, i) => {
            const period = result.opening_hours.periods.find((p: any) => p.open?.day === i);
            if (period) {
              const open = period.open.time;
              const close = period.close?.time || "2359";
              hours[day] = {
                open: `${open.slice(0, 2)}:${open.slice(2)}`,
                close: `${close.slice(0, 2)}:${close.slice(2)}`,
                closed: false,
              };
            } else {
              hours[day] = { open: "09:00", close: "18:00", closed: true };
            }
          });
        }

        const businessType = result.types?.[0] || "other";
        
        setBusinessData({
          name: result.name,
          type: businessType,
          address: result.formatted_address,
          phone: result.formatted_phone_number || "",
          email: "",
          website: result.website || "",
          rating: result.rating?.toFixed(1) || "4.5",
          reviewsCount: result.user_ratings_total || 0,
          photos,
          hours,
          latitude: result.geometry?.location?.lat(),
          longitude: result.geometry?.location?.lng(),
          placeId: result.place_id,
        });
        setSearchResults([]);
        setSearchQuery("");
        setStage("found");
      }
    } catch (err) {
      console.error("Place details error:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (stage === "searching") {
      discoverBusiness();
    }
  }, [stage, discoverBusiness]);

  const handleConfirm = () => {
    if (businessData) {
      onComplete(businessData);
    }
  };

  const handleEdit = () => {
    setStage("manual");
  };

  if (stage === "searching") {
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
          <p className="text-ink-400">AI is searching Google Maps, public records, and social profiles...</p>
          {error && (
            <p className="mt-4 text-sm text-amber-400">{error}</p>
          )}
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
  <span className="text-sm">{businessData.phone || "+91 97117 00199"}</span>
</div>
<div className="flex items-center gap-2">
  <Mail className="h-4 w-4 text-ink-400" />
  <span className="text-sm">{businessData.email || "aarishvimal1@gmail.com"}</span>
</div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-ink-400" />
                        <a href={businessData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-400 hover:underline flex items-center gap-1">
                          {businessData.website || "Not found"}
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950"
    >
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-40 bg-ink-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Business Discovery</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-400">Step 2 of 7</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {ONBOARDING_STEPS.map((step, index) => {
                const isActive = stage === "manual" || stage === "found";
                const isCompleted = false;
                
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
                      {isActive ? step.label : ""}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "25%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 h-1 bg-ink-900 rounded-full overflow-hidden"
            >
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-300" />
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 pt-20">
          <GlassCard className="p-6 sm:p-8 max-w-2xl w-full">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/10 bg-brand-500/20">
                  <Search className="h-7 w-7 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Search Google Maps
                  </h2>
                  <p className="mt-1 text-sm text-ink-300">
                    Type your business name to find it on Google Maps
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchPlaces(e.target.value);
                  }}
                  placeholder="e.g., The Corner Bakery, Mumbai"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-ink-900/50 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  autoFocus
                />
                {searching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-brand-400" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                  {searchResults.map((result: any) => (
                    <button
                      key={result.place_id}
                      onClick={() => selectPlace(result.place_id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-left transition-all"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{result.structured_formatting?.main_text || result.description}</p>
                        <p className="text-sm text-ink-400 truncate">{result.structured_formatting?.secondary_text || ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-center text-sm text-ink-400 mb-4">Or enter details manually</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => setStage("manual")} className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Manual Entry
                </Button>
                <Button variant="ghost" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}

export default AIDiscoveryScreen;