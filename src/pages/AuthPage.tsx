import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, 
  CheckCircle, Loader2, User, Sparkles, Zap, Shield, 
  Search, Save, Building2, Users, MessageSquare, MapPin,
  Check, X, Globe, Smartphone, Phone, HeartPulse,
  Dumbbell, Wrench, Briefcase, Factory, GraduationCap,
  Truck, Scale, UtensilsCrossed, Store, Sparkles as SparklesIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const AUTH_STEPS = {
  WELCOME: "welcome",
  PROVIDER_SELECT: "provider_select",
  EMAIL_INPUT: "email_input",
  PASSWORD_INPUT: "password_input",
  OTP_VERIFY: "otp_verify",
  NAME_INPUT: "name_input",
} as const;

type AuthStep = typeof AUTH_STEPS[keyof typeof AUTH_STEPS];

interface AuthFormData {
  email: string;
  password: string;
  displayName: string;
  otp: string;
}

export function AuthPage({ onComplete }: { onComplete: () => void }) {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, sendOTP, verifyOTP, updateProfile } = useAuth();
  const [step, setStep] = useState<AuthStep>("welcome");
  const [formData, setFormData] = useState<AuthFormData>({ email: "", password: "", displayName: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setInterval(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCooldown]);

  const handleProviderSignIn = useCallback(async (provider: "google") => {
    setLoading(true);
    setError(null);
    try {
      if (provider === "google") {
        await signInWithGoogle();
      }
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle]);

  const handleEmailContinue = useCallback(async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendOTP(formData.email);
      setOtpSent(true);
      setOtpCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [formData.email, sendOTP]);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const verified = await verifyOTP(formData.email, formData.otp);
      if (verified) {
        const { getUserProfile } = await import("@/lib/firebase");
        const profile = await getUserProfile(user?.uid || "");
        if (!profile?.displayName) {
          setStep("name_input");
        } else {
          onComplete();
        }
      } else {
        setError("Invalid or expired code");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpResend = useCallback(async () => {
    if (otpCooldown > 0) return;
    setLoading(true);
    try {
      await sendOTP(formData.email);
      setOtpCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  }, [formData.email, sendOTP, otpCooldown]);

  const handleNameComplete = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateProfile({ display_name: name.trim() } as Partial<any>);
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const WelcomeStep = ({ onContinue }: { onContinue: () => void }) => (
    <div className="text-center space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl font-semibold tracking-tight text-white"
      >
        Welcome to Azolik
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-[13px] text-ink-400 max-w-sm mx-auto"
      >
        Your AI workforce is ready. Six departments. Forty-four agents. One click to begin.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center justify-center gap-3"
      >
        <Button variant="primary" size="lg" onClick={onContinue} className="gap-3">
          <Sparkles className="h-4.5 w-4.5" />
          Get Started
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 text-[11px] text-ink-500"
      >
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-brand-400 hover:text-brand-300 underline">Terms of Service</a>{' '}
        and{' '}
        <a href="/privacy" className="text-brand-400 hover:text-brand-300 underline">Privacy Policy</a>
      </motion.p>
    </div>
  );

  const ProviderSelectStep = ({ loading }: { loading: boolean }) => (
    <div className="space-y-4">
      <h3 className="text-[18px] font-semibold text-white">How would you like to sign in?</h3>
      <p className="mt-0.5 text-[12px] text-ink-400">Choose your preferred sign-in method</p>

      <div className="space-y-3 mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleProviderSignIn("google")}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 text-left transition-all"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20">
            <Sparkles className="h-4.5 w-4.5 text-brand-300" />
          </div>
          <span className="text-[13px] font-medium text-white">Continue with Google</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep("email_input")}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:text-white"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
            <Mail className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <span className="text-[13px] font-medium text-white">Email OTP</span>
        </motion.button>
      </div>

      <Button variant="ghost" onClick={() => setStep("welcome")} className="w-full gap-2 mt-4">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    </div>
  );

  const EmailInputStep = ({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) => {
    const [email, setEmail] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !email.includes("@")) {
        setLocalError("Please enter a valid email address");
        return;
      }
      onContinue();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Enter your email</h2>
          <p className="mt-1 text-[13px] text-ink-400">We'll send a 6-digit code to verify your identity</p>
        </div>

        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 focus-within:border-brand-400/30 focus-within:ring-2 focus-within:ring-brand-500/20">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setLocalError(null); }}
            placeholder="you@company.com"
            className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-ink-500 focus:outline-none"
          />
        </div>
        {localError && <p className="text-sm text-rose-400">{localError}</p>}

        <Button size="lg" variant="primary" className="w-full gap-1" onClick={onContinue} disabled={!email || !email.includes("@")}>
          <ArrowRight className="h-4 w-4" /> Continue
        </Button>

        <Button variant="ghost" onClick={onBack} className="w-full gap-2 mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </form>
    );
  };

  const PasswordInputStep = ({ onSubmit, onBack }: { onSubmit: (e: React.FormEvent) => void; onBack: () => void }) => {
    const [password, setPassword] = useState("");
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password) {
        setLocalError("Please enter your password");
        return;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }

      setLocalLoading(true);
      setLocalError(null);
      try {
        await onSubmit(e);
      } catch (err: any) {
        setLocalError(err.message || "Invalid credentials");
      } finally {
        setLocalLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="mt-1 text-[13px] text-ink-400">Enter your password to continue</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-white/10 bg-ink-900/50 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button size="lg" type="submit" className="w-full gap-2" disabled={localLoading || !password}>
            {localLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <Button variant="ghost" onClick={onBack} className="w-full gap-2 mt-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </form>
    );
  };

  const OtpVerifyStep = ({ email, onVerify, onResend, onBack, loading, otpCooldown }: any) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleOtpChange = (index: number, value: string) => {
      if (value.length > 1) value = value.slice(-1);
      const newOtp = [...otp];
      newOtp[index] = value.toUpperCase();
      setOtp(newOtp);
      if (value && index < 5) {
        const inputs = document.querySelectorAll('input[name="otp"]');
        if (inputs[index + 1]) (inputs[index + 1] as HTMLInputElement).focus();
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const code = otp.join("");
      if (code.length === 6) onVerify(code);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 mx-auto mb-4"
          >
            <CheckCircle className="h-7 w-7 text-emerald-400" />
          </motion.div>
          <h3 className="text-[15px] font-medium text-white mb-1">Check your email</h3>
          <p className="mt-1 text-[11px] text-ink-400">We sent a 6-digit code to</p>
          <p className="text-[13px] font-medium text-white">{email}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {otp.map((char, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              name="otp"
              className="w-10 h-12 text-center text-2xl font-semibold rounded-xl border border-white/10 bg-white/[0.02] text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {otp.length === 6 && !loading && (
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium bg-gradient-to-r from-brand-500 to-brand-700 text-white"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Verify Code</span>
          </motion.button>
        )}

        {loading && (
          <Button type="submit" disabled className="w-full gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying...</span>
          </Button>
        )}

        <div className="text-center text-sm text-ink-500">
          Didn't receive the code?{' '}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResend}
            disabled={otpCooldown > 0 || loading}
            className="text-brand-400 hover:text-brand-300 p-0 h-auto"
          >
            {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend code"}
          </Button>
        </div>

        <Button variant="ghost" onClick={onBack} className="w-full gap-2 mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </form>
    );
  };

  const NameInputStep = ({ onComplete, onBack }: { onComplete: (name: string) => void; onBack: () => void }) => {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      onComplete(name.trim());
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[18px] font-semibold text-white"
          >
            What's your name?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] text-ink-400"
          >
            This will be shown across your workspace and communications.
          </motion.p>
        </div>

        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aarish Sharma"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
          />
        </div>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={!name.trim() || saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Create my account</span>
            </>
          )}
        </Button>

        <Button variant="ghost" onClick={onBack} className="w-full gap-2 mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </form>
    );
  };

  const renderStep = (step: AuthStep) => {
    switch (step) {
      case "welcome":
        return <WelcomeStep onContinue={() => setStep("provider_select")} />;
      case "provider_select":
        return <ProviderSelectStep loading={loading} />;
      case "email_input":
        return <EmailInputStep onContinue={handleEmailContinue} onBack={() => setStep("provider_select")} />;
      case "password_input":
        return <PasswordInputStep onSubmit={handlePasswordSignIn} onBack={() => setStep("email_input")} />;
      case "otp_verify":
        return <OtpVerifyStep
          email={formData.email}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onBack={() => setStep("email_input")}
          loading={loading}
          otpCooldown={otpCooldown}
        />;
      case "name_input":
        return <NameInputStep onComplete={handleNameComplete} onBack={() => setStep("otp_verify")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[200px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_8px_24px_-6px_rgba(95,118,255,0.6),inset_0_1px_0_rgba(255,255,255,0.3)]">
                    <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
                  </div>
                  <div>
                    <h1 className="text-[14.5px] font-semibold tracking-[-0.02em] text-white">Azolik</h1>
                    <p className="text-[10px] font-medium italic text-ink-400">Most AIs work with you. Azolik works for you.</p>
                  </div>
                </div>
                {step !== "welcome" && (
                  <Button variant="ghost" size="sm" onClick={() => setStep("welcome")} className="text-ink-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {renderStep(step)}
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-center gap-2">
                {["welcome", "provider_select", "email_input", "password_input", "otp_verify", "name_input"].map((s, i) => (
                  <motion.span
                    key={s}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      step === s ? "bg-brand-500 w-8" : "bg-white/10 w-2"
                    )}
                    whileHover={{ scale: 1.2 }}
                    transition={{ delay: i * 0.03 }}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}