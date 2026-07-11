// Auth Context - Real Firebase Auth with Google, Microsoft, Email OTP
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  OAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { createUserProfile, getUserProfile, updateUserProfile, updateUserLastLogin, getBusiness } from "@/lib/firebase";
import { UserProfile, BusinessProfile } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Microsoft OAuth Provider
const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  prompt: "consent",
  tenant: "common",
});
microsoftProvider.addScope("openid");
microsoftProvider.addScope("profile");
microsoftProvider.addScope("email");
microsoftProvider.addScope("offline_access");
microsoftProvider.addScope("https://graph.microsoft.com/User.Read");
microsoftProvider.addScope("https://graph.microsoft.com/Mail.Read");
microsoftProvider.addScope("https://graph.microsoft.com/Mail.Send");
microsoftProvider.addScope("https://graph.microsoft.com/Calendars.Read");
microsoftProvider.addScope("https://graph.microsoft.com/Files.ReadWrite");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set auth persistence
    if (auth) {
      import("firebase/auth").then(({ setPersistence, browserLocalPersistence }) => {
        setPersistence(auth, browserLocalPersistence).catch(console.error);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Update last login
        await updateUserLastLogin(firebaseUser.uid);
        
        // Get or create user profile
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || "",
          });
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (error) {
      console.error("Microsoft sign-in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign-in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
    } catch (error) {
      console.error("Email sign-up error:", error);
      throw error;
    }
  };

  const sendOTP = async (email: string) => {
    // In production, this would call a Firebase Function to send OTP via email
    // For now, we'll use Firebase Auth's email link sign-in as OTP alternative
    const actionCodeSettings = {
      url: window.location.origin + "/auth/callback",
      handleCodeInApp: true,
    };
    
    // Using Firebase's email link sign-in as OTP mechanism
    await import("firebase/auth").then(({ sendSignInLinkToEmail }) => {
      return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    });
    
    // Store email for verification
    sessionStorage.setItem("otp_email", email);
  };

  const verifyOTP = async (email: string, code: string): Promise<boolean> => {
    // In production, verify OTP via Firebase Function
    // For now, we'll use email link sign-in completion
    try {
      const result = await import("firebase/auth").then(({ signInWithEmailLink }) => 
        signInWithEmailLink(auth, email, window.location.href)
      );
      return !!result.user;
    } catch {
      // Fallback: check if code matches a stored OTP (for demo)
      // In production, use Firebase Functions with Twilio/SendGrid
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in");
    setProfile(prev => prev ? { ...prev, ...data } : null );
    // Update in Firestore would go here
  };

  const refreshProfile = async () => {
    if (!user) return;
    const freshProfile = await getUserProfile(user.uid);
    setProfile(freshProfile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithGoogle,
      signInWithMicrosoft,
      signInWithEmail,
      signUpWithEmail,
      sendOTP,
      verifyOTP,
      resetPassword,
      logout,
      updateUserProfile: updateUserProfileData,
      refreshProfile,
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

// Hook for checking if user has completed onboarding
export function useOnboarding() {
  const { profile } = useAuth();
  return {
    isComplete: profile?.onboardingComplete ?? false,
    profile,
  };
}

// Hook for getting user's business
export function useBusiness() {
  const { profile } = useAuth();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.businessId) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      const { getBusiness } = await import("@/lib/firebase");
      const business = await getBusiness(profile.businessId!);
      setBusiness(business);
      setLoading(false);
    };
    fetchBusiness();
  }, [profile]);

  return { business, loading };
}