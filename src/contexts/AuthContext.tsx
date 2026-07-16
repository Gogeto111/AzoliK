import { createContext, useContext, useState, ReactNode } from "react";
import {
  type User,
} from "firebase/auth";
import {
  type UserProfile,
  type BusinessProfile,
  type OnboardingData,
  createDefaultBusinessProfile,
} from "@/lib/firebase";

const MOCK_USER = {
  uid: "local-user",
  email: "aarishvimal1@gmail.com",
  displayName: "User",
  emailVerified: true,
  isAnonymous: false,
  metadata: {} as any,
  providerData: [],
  refreshToken: "",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "",
  getIdTokenResult: () => Promise.resolve({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: "9711700199",
  photoURL: null,
  providerId: "local",
} as unknown as User;

const MOCK_PROFILE: UserProfile = {
  uid: "local-user",
  email: "aarishvimal1@gmail.com",
  displayName: "User",
  businessId: "local-business",
  onboardingComplete: true,
  onboardingStep: 10,
  role: "owner",
  preferences: {
    notifications: { email: true, push: true, sms: false },
    theme: "dark",
    language: "en",
    timezone: "Asia/Kolkata",
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastLoginAt: Date.now(),
};

const MOCK_BUSINESS: BusinessProfile = {
  id: "local-business",
  name: "My Business",
  type: "ecommerce",
  ownerId: "local-user",
  phone: "9711700199",
  currency: "INR",
  timezone: "Asia/Kolkata",
  settings: {
    autoReply: true,
    businessHours: {
      enabled: true,
      timezone: "Asia/Kolkata",
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
    autoInvoice: true,
    taxRate: 18,
    currencyFormat: "\u20B9",
  },
  integrations: {},
  departments: ["support", "sales", "marketing", "finance", "operations"],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

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
  updateBusiness: (data: Partial<BusinessProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<BusinessProfile>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [business, setBusiness] = useState<BusinessProfile>(MOCK_BUSINESS);

  const updateProfile = async (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const updateBusiness = async (data: Partial<BusinessProfile>) => {
    setBusiness(prev => ({ ...prev, ...data }));
  };

  const refreshProfile = async () => {};

  const completeOnboarding = async (data: OnboardingData): Promise<BusinessProfile> => {
    const newBusiness = createDefaultBusinessProfile("local-user", data);
    setBusiness(newBusiness);
    setProfile(prev => ({ ...prev, businessId: newBusiness.id, onboardingComplete: true }));
    return newBusiness;
  };

  return (
    <AuthContext.Provider value={{
      user: MOCK_USER,
      profile,
      business,
      loading: false,
      signInWithGoogle: async () => {},
      signInWithEmail: async () => {},
      signUpWithEmail: async () => {},
      sendOTP: async () => {},
      verifyOTP: async () => true,
      resetPassword: async () => {},
      logout: async () => {},
      updateProfile,
      updateBusiness,
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
