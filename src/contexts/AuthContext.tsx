import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { sb, UserProfile, BusinessProfile, OnboardingData, createDefaultUserProfile, createDefaultDepartments } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  business: BusinessProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<BusinessProfile>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    if (auth) {
      import("firebase/auth").then(({ setPersistence, browserLocalPersistence }) => {
        setPersistence(auth, browserLocalPersistence).catch(console.error);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await refreshProfile();
        await refreshBusiness();
      } else {
        setProfile(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await sb
        .from("user_profiles")
        .select("*")
        .eq("auth_user_id", user.uid)
        .single();
      
      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        const newProfile = createDefaultUserProfile(user.uid, user.email || "", user.displayName || "");
        const { data: created, error: createError } = await sb
          .from("user_profiles")
          .insert(newProfile)
          .select()
          .single();
        
        if (!createError) {
          setProfile(created);
        }
      } else if (data) {
        setProfile(data);
        // Update last login
        await sb.from("user_profiles").update({ last_login_at: new Date().toISOString() }).eq("id", data.id);
      }
    } catch (e) {
      console.error("Error refreshing profile:", e);
    }
  };

  const refreshBusiness = async () => {
    if (!profile?.business_id) {
      setBusiness(null);
      return;
    }
    try {
      const { data, error } = await sb
        .from("businesses")
        .select("*")
        .eq("id", profile.business_id)
        .single();
      
      if (!error && data) {
        setBusiness(data);
      }
    } catch (e) {
      console.error("Error refreshing business:", e);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not configured. Please set VITE_FIREBASE_API_KEY.");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured. Please set VITE_FIREBASE_API_KEY.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign-in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error("Firebase not configured. Please set VITE_FIREBASE_API_KEY.");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(result.user, { displayName });
    } catch (error) {
      console.error("Email sign-up error:", error);
      throw error;
    }
  };

  const sendOTP = async (email: string) => {
    if (!auth) throw new Error("Firebase not configured. Please set VITE_FIREBASE_API_KEY.");
    const actionCodeSettings = {
      url: window.location.origin + "/auth/callback",
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    sessionStorage.setItem("otp_email", email);
  };

  const verifyOTP = async (email: string, code: string): Promise<boolean> => {
    if (!auth) return false;
    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        return !!result.user;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not configured. Please set VITE_FIREBASE_API_KEY.");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) { setProfile(null); setBusiness(null); return; }
    try {
      await signOut(auth);
      setProfile(null);
      setBusiness(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error("No user logged in");
    try {
      const { data: updated, error } = await sb
        .from("user_profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .select()
        .single();
      
      if (!error) setProfile(updated);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<BusinessProfile> => {
    if (!user || !profile) throw new Error("No user logged in");

    // Create business
    const businessData = {
      owner_id: profile.id,
      name: data.businessName,
      type: data.businessType,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      place_id: data.placeId,
      currency: data.currency,
      timezone: data.timezone,
      settings: {
        auto_reply: true,
        business_hours: {
          enabled: true,
          timezone: data.timezone,
          schedule: {
            monday: { open: "09:00", close: "18:00", closed: false },
            tuesday: { open: "09:00", close: "18:00", closed: false },
            wednesday: { open: "09:00", close: "18:00", closed: false },
            thursday: { open: "09:00", close: "18:00", closed: false },
            friday: { open: "09:00", close: "18:00", closed: false },
            saturday: { open: "09:00", close: "14:00", closed: false },
            sunday: { open: "10:00", close: "14:00", closed: true },
          },
        },
        auto_invoice: true,
        tax_rate: 18,
        currency_format: "₹",
      },
      integrations: {},
      departments: data.departments,
    };

    const { data: business, error: bizError } = await sb
      .from("businesses")
      .insert(businessData)
      .select()
      .single();

    if (bizError) throw bizError;

    // Create departments
    const departments = createDefaultDepartments(business.id, data.departments);
    for (const dept of departments) {
      await sb.from("departments").insert(dept);
    }

    // Store knowledge base
    for (const [category, items] of Object.entries(data.knowledge)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          await sb.from("knowledge_base").insert({
            business_id: business.id,
            category,
            title: item,
            content: item,
            metadata: {},
          });
        }
      }
    }

    // Update user profile
    await sb
      .from("user_profiles")
      .update({ 
        business_id: business.id, 
        onboarding_complete: true, 
        onboarding_step: 10,
        updated_at: new Date().toISOString() 
      })
      .eq("id", profile.id);

    setBusiness(business);
    setProfile(prev => prev ? { ...prev, business_id: business.id, onboarding_complete: true } : null);

    return business;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      business,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendOTP,
      verifyOTP,
      resetPassword,
      logout,
      updateProfile,
      refreshProfile,
      completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useBusiness() {
  const { business } = useAuth();
  return { business, loading: !business };
}

export function useOnboarding() {
  const { profile } = useAuth();
  return {
    isComplete: profile?.onboarding_complete ?? false,
    step: profile?.onboarding_step ?? 0,
  };
}