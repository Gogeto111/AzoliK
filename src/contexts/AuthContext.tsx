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
import {
  auth,
  googleProvider,
  db,
  UserProfile,
  BusinessProfile,
  OnboardingData,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  createBusiness,
  getBusiness,
  createDepartment,
  createDefaultUserProfile,
  updateUserLastLogin,
} from "@/lib/firebase";

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
        await refreshProfile(firebaseUser);
        await refreshBusiness(firebaseUser);
      } else {
        setProfile(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async (firebaseUser?: User | null) => {
    const currentUser = firebaseUser ?? user;
    if (!currentUser) return;
    try {
      let userProfile = await getUserProfile(currentUser.uid);
      
      if (!userProfile) {
        const defaultProfile = createDefaultUserProfile(currentUser.uid, currentUser.email || "", currentUser.displayName || "");
        userProfile = await createUserProfile(currentUser.uid, defaultProfile);
        setProfile(userProfile);
      } else {
        setProfile(userProfile);
        await updateUserLastLogin(currentUser.uid);
      }
    } catch (e) {
      console.error("Error refreshing profile:", e);
    }
  };

  const refreshBusiness = async (firebaseUser?: User | null) => {
    const currentUser = firebaseUser ?? user;
    // Re-read profile from state since it may have just been set
    const currentProfile = profile ?? (currentUser ? await getUserProfile(currentUser.uid) : null);
    if (!currentProfile?.businessId) {
      setBusiness(null);
      return;
    }
    try {
      const businessData = await getBusiness(currentProfile.businessId);
      if (businessData) {
        setBusiness(businessData);
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
      await updateUserProfile(user.uid, data);
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<BusinessProfile> => {
    if (!user || !profile) throw new Error("No user logged in");

    const newBusiness = await createBusiness(user.uid, data);

    setBusiness(newBusiness);
    setProfile(prev => prev ? { ...prev, businessId: newBusiness.id, onboardingComplete: true } : null);

    return newBusiness;
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
    isComplete: profile?.onboardingComplete ?? false,
    step: profile?.onboardingStep ?? 0,
  };
}
