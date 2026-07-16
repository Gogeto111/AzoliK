// Landing Page - The entry point before authentication
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Bot, 
  Zap, 
  Shield, 
  Globe, 
  Clock,
  MessageSquare,
  BarChart3,
  Wallet,
  Cpu,
  Zap as ZapIcon,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";

const DEPARTMENTS = [
  { name: "Support", icon: MessageSquare, color: "from-cyan-500 to-cyan-700", description: "Never lose a customer while you're asleep. 24/7 replies, FAQs, order tracking.", agents: 8 },
  { name: "Sales", icon: Users, color: "from-emerald-500 to-emerald-700", description: "Every lead followed up. Every quote sent. Every payment collected.", agents: 6 },
  { name: "Marketing", icon: BarChart3, color: "from-violet-500 to-violet-700", description: "Posts, campaigns, and content — scheduled and published while you focus on growth.", agents: 5 },
  { name: "Finance", icon: Wallet, color: "from-amber-500 to-amber-700", description: "Invoices sent. Expenses tracked. Reconciliation done. Zero bookkeeping stress.", agents: 4 },
  { name: "Operations", icon: Cpu, color: "from-orange-500 to-orange-700", description: "Inventory synced. Orders processed. Fulfillment coordinated — automatically.", agents: 6 },
  { name: "HR", icon: Users, color: "from-rose-500 to-rose-700", description: "Hiring, onboarding, and team management without the admin overhead.", agents: 3 },
];

const FEATURES = [
  { icon: Clock, title: "Get Your Evenings Back", desc: "Stop answering messages at 11 PM. Your AI team handles customer queries, orders, and follow-ups — day and night." },
  { icon: Zap, title: "Never Miss a Lead", desc: "Every inquiry gets a response in seconds. Every quote gets followed up. No lead falls through the cracks." },
  { icon: Shield, title: "You Stay in Control", desc: "Approve, edit, or auto-send. Your AI team works for you — not instead of you." },
  { icon: Globe, title: "Works Where You Work", desc: "WhatsApp, Gmail, Sheets, Calendar, Razorpay, Shopify — connected in one click." },
  { icon: Cpu, title: "Learns Your Business", desc: "Your products, prices, policies, FAQs — all loaded in. It knows your business like a 2-year employee." },
  { icon: Users, title: "Quick Setup", desc: "Sign up. Tell us about your business. Your AI workforce starts working. No engineers needed." },
];

const INDUSTRIES = [
  { id: "restaurant", label: "Restaurant & Food", icon: "🍽️" },
  { id: "retail", label: "Retail & E-commerce", icon: "🛍️" },
  { id: "healthcare", label: "Healthcare & Clinics", icon: "🏥" },
  { id: "fitness", label: "Fitness & Wellness", icon: "💪" },
  { id: "beauty", label: "Beauty & Salon", icon: "💄" },
  { id: "services", label: "Professional Services", icon: "💼" },
  { id: "manufacturing", label: "Manufacturing", icon: "🏭" },
  { id: "education", label: "Education & Training", icon: "📚" },
  { id: "real-estate", label: "Real Estate", icon: "🏠" },
  { id: "automotive", label: "Automotive", icon: "🚗" },
  { id: "hospitality", label: "Hospitality & Travel", icon: "🏨" },
  { id: "other", label: "Other", icon: "✨" },
];

// 3D Floating Cards Component
function Floating3DCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
      setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0, y: 0 });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <div className="relative" style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
      {/* 3D Glow Layers */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-violet-500/20 rounded-2xl"
        style={{
          transform: "translateZ(-20px) scale(1.05)",
          filter: "blur(30px)",
          opacity: 0.5,
          transformStyle: "preserve-3d",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10 rounded-2xl"
        style={{
          transform: "translateZ(-40px) scale(1.1)",
          filter: "blur(60px)",
          opacity: 0.3,
          transformStyle: "preserve-3d",
        }}
      />
    </motion.div>
  );
}

// 3D Orb Background
function Orb3DBackground() {
  const [orbs] = useState([
    { x: 20, y: 20, size: 400, color: "brand", delay: 0 },
    { x: 80, y: 30, size: 300, color: "violet", delay: 2 },
    { x: 60, y: 80, size: 350, color: "cyan", delay: 4 },
    { x: 10, y: 70, size: 250, color: "emerald", delay: 1 },
    { x: 90, y: 60, size: 280, color: "amber", delay: 3 },
  ]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[200px] opacity-30"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            marginLeft: `-${orb.size / 2}px`,
            marginTop: `-${orb.size / 2}px`,
            background: `radial-gradient(circle at 30% 30%, ${orb.color === "brand" ? "rgba(95,131,255,0.6)" : orb.color === "violet" ? "rgba(167,139,250,0.5)" : orb.color === "cyan" ? "rgba(34,211,238,0.4)" : orb.color === "emerald" ? "rgba(52,211,153,0.4)" : "rgba(251,191,36,0.4)"}, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: 1, x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{
            opacity: { delay: orb.delay, duration: 1.5, ease: [0.22, 1, 0.36, 1] },
            scale: { delay: orb.delay, duration: 4, repeat: Infinity, ease: "easeInOut" },
            x: { delay: orb.delay, duration: 8, repeat: Infinity, ease: "easeInOut" },
            y: { delay: orb.delay, duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

// 3D Grid Pattern
function Grid3DPattern() {
  return (
    <div
      className="absolute inset-0 -z-10 opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        transform: "perspective(1000px) rotateX(60deg) translateZ(-100px) translateY(100px)",
        transformOrigin: "center top",
      }}
    />
  );
}

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [showGetInTouch, setShowGetInTouch] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) errors.phone = "Invalid phone number";
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.industry) errors.industry = "Please select your industry";
    if (!formData.message.trim()) errors.message = "Message is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setShowMeetingScheduler(true);
  };

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => ({ ...prev, industry }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 overflow-x-hidden">
      {/* 3D Background System */}
      <Orb3DBackground />
      <Grid3DPattern />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_8px_24px_-6px_rgba(95,131,255,0.6)]">
            <img 
              src="/logo.svg" 
              alt="Azolik Logo" 
              className="h-6 w-6 object-contain"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const sparkles = target.nextElementSibling as HTMLElement;
                if (sparkles) sparkles.style.display = 'flex';
              }}
            />
            <Sparkles className="h-5 w-5 text-white hidden" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">Azolik</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => setShowGetInTouch(true)}>
            Let's Talk
          </Button>
          <Button size="sm" onClick={onGetStarted} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-5xl">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 border border-brand-500/30 px-4 py-1.5 text-sm font-medium text-brand-300 mb-6"
              >
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-brand-500"
                />
                <span className="font-semibold">Your business shouldn't stop when you do</span>
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.05] mb-6"
              >
                Never lose another customer
                <br />
                <span className="bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent">
                  while you're asleep.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl text-ink-300 max-w-2xl mx-auto leading-relaxed text-balance"
              >
                Six AI departments working around the clock — so you can focus on growing your business, not managing it.
              </motion.p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="gap-3 px-8 py-4 text-lg shadow-[0_12px_40px_-12px_rgba(95,131,255,0.5)]"
              >
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 px-6 py-3 border-white/10 hover:border-white/20"
              >
                <BarChart3 className="h-5 w-5" />
                See Live Demo
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 px-6 sm:px-8 border-y border-white/5 bg-ink-950/50">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Businesses Automated", icon: Bot },
                { value: "24/7", label: "AI Coverage", icon: Clock },
                { value: "<2min", label: "Average Response", icon: Zap },
                { value: "98%", label: "Customer Satisfaction", icon: CheckCircle2 },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-inset ring-brand-500/20 mx-auto mb-3">
                    <stat.icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-sm text-ink-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Departments Preview */}
        <section className="py-16 sm:py-24 px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Your AI Workforce
              </motion.span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Your business runs 24/7. Now your team does too.
              </h2>
              <p className="mt-3 text-lg text-ink-300 max-w-2xl mx-auto">
                Each department works around the clock — replying to customers, following up on leads, sending invoices, and managing operations. While you sleep.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {DEPARTMENTS.map((dept, i) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GlassCard className="p-6 h-full group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10",
                        `bg-gradient-to-br ${dept.color}`
                      )}>
                        <dept.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-semibold text-white">{dept.name}</h3>
                        <p className="mt-1 text-sm text-ink-300">{dept.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-ink-400 flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        {dept.agents} AI agents
                      </span>
                      <span className="text-xs text-brand-400 font-medium">
                        Active now →
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 bg-ink-950/50 border-y border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Why Companies Choose Azolik
              </h2>
              <p className="mt-3 text-lg text-ink-300 max-w-2xl mx-auto">
                Not another chatbot. A complete AI operating system for your business.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-inset ring-brand-500/20 mb-4">
                      <feature.icon className="h-6 w-6 text-brand-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-ink-300 leading-relaxed">{feature.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24 px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                Simple Setup
              </motion.span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Up and running in 3 steps
              </h2>
              <p className="mt-3 text-lg text-ink-300 max-w-2xl mx-auto">
                No engineers. No months of implementation. Your AI workforce starts working today.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
              {[
                {
                  step: "01",
                  title: "Tell Us About Your Business",
                  desc: "Share your products, pricing, policies, and FAQs. It takes about 15 minutes.",
                  icon: MessageSquare,
                  color: "from-cyan-500 to-cyan-700",
                },
                {
                  step: "02",
                  title: "We Build Your AI Team",
                  desc: "We configure and train your six AI departments to match your business exactly.",
                  icon: Cpu,
                  color: "from-brand-500 to-brand-700",
                },
                {
                  step: "03",
                  title: "Your Business Runs 24/7",
                  desc: "Connect your channels and watch your AI team handle customers, leads, and operations.",
                  icon: Zap,
                  color: "from-emerald-500 to-emerald-700",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative text-center"
                >
                  <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-5 ring-1 ring-inset ring-white/10",
                    `bg-gradient-to-br ${item.color}`
                  )}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="inline-block text-xs font-bold text-brand-400 tracking-widest mb-2">STEP {item.step}</span>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-ink-300 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Get in Touch Section */}
        <section className="py-16 sm:py-24 px-6 sm:px-8" id="get-in-touch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Get in Touch
              </h2>
              <p className="mt-3 text-lg text-ink-300 max-w-2xl mx-auto">
                Have questions? Want to see a demo? Our team is ready to help you automate your business.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <GlassCard className="p-8 h-full">
                <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-inset ring-brand-500/20">
                      <Mail className="h-6 w-6 text-brand-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Email</h4>
                      <p className="mt-1 text-ink-300">aarishvimal1@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-inset ring-brand-500/20">
                      <Phone className="h-6 w-6 text-brand-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Phone</h4>
                      <p className="mt-1 text-ink-300">+91 97117 00199</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-inset ring-brand-500/20">
                      <MapPin className="h-6 w-6 text-brand-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Office</h4>
                      <p className="mt-1 text-ink-300">Available worldwide — remote first</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Contact Form */}
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {submitSuccess ? "Request Submitted!" : "Send us a Message"}
                </h3>
                
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Thanks for reaching out!</h4>
                    <p className="text-ink-300 mb-6">We'll get back to you within 24 hours. Ready to schedule a meeting?</p>
                    <Button 
                      size="lg" 
                      onClick={() => {
                        setShowGetInTouch(false);
                        setShowMeetingScheduler(true);
                        setSubmitSuccess(false);
                      }}
                      className="gap-2 w-full"
                    >
                      <Send className="h-4 w-4" />
                      Schedule a Meeting
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-ink-300 mb-1">Full Name *</label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          error={formErrors.name}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-ink-300 mb-1">Email *</label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@company.com"
                          error={formErrors.email}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-ink-300 mb-1">Phone *</label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 97117 00199"
                          error={formErrors.phone}
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-ink-300 mb-1">Company *</label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Acme Inc."
                          error={formErrors.company}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-ink-300 mb-1">Industry *</label>
                      <div className="relative">
                        <select
                          id="industry"
                          value={formData.industry}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleIndustryChange(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none bg-no-repeat bg-right pr-10 cursor-pointer"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238faeff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
                        >
                          <option value="">Select your industry</option>
                          {INDUSTRIES.map((ind) => (
                            <option key={ind.id} value={ind.id}>{ind.label}</option>
                          ))}
                        </select>
                        {formErrors.industry && (
                          <p className="mt-1 text-sm text-rose-400">{formErrors.industry}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-ink-300 mb-1">Message *</label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us about your business and what you're looking for..."
                        rows={4}
                        error={formErrors.message}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-ink-500">
                      By submitting, you agree to our Privacy Policy and Terms of Service.
                    </p>
                  </form>
                )}
              </GlassCard>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <GlassCard className="p-8 sm:p-12 relative overflow-hidden" tone="strong">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-violet-500/10" />
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 22 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mx-auto mb-6"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
                  Your business shouldn't stop when you do.
                </h2>
                <p className="text-lg text-ink-300 mb-8 max-w-lg mx-auto">
                  Join thousands of businesses that never sleep. Start free, cancel anytime.
                </p>
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="gap-3 px-8 py-4 text-lg shadow-[0_12px_40px_-12px_rgba(95,131,255,0.5)]"
                >
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="mt-4 text-sm text-ink-500">
                  No credit card required · 14-day free trial · Cancel anytime
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Azolik</span>
              </div>
              <p className="text-sm text-ink-400">Your business runs 24/7. Now your team does too.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-ink-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Departments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Automation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-ink-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-ink-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-ink-500">© 2025 Azolik. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-ink-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-ink-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </a>
              <a href="#" className="text-ink-400 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-3.903 8.199-8.353 0-4.535-2.823-8.273-6.236-9.348z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Get in Touch Modal */}
      <AnimatePresence>
        {showGetInTouch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGetInTouch(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" tone="strong">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Get in Touch</h2>
                    <p className="mt-1 text-ink-400">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
                  </div>
                  <button
                    onClick={() => setShowGetInTouch(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Thanks for reaching out!</h3>
                    <p className="text-ink-300 mb-6">We'll get back to you within 24 hours.</p>
                    <Button 
                      size="lg" 
                      onClick={() => {
                        setShowGetInTouch(false);
                        setShowMeetingScheduler(true);
                        setSubmitSuccess(false);
                      }}
                      className="gap-2 w-full"
                    >
                      <Send className="h-4 w-4" />
                      Schedule a Meeting
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="modal-name" className="block text-sm font-medium text-ink-300 mb-1">Full Name *</label>
                        <Input
                          id="modal-name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          error={formErrors.name}
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-email" className="block text-sm font-medium text-ink-300 mb-1">Email *</label>
                        <Input
                          id="modal-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@company.com"
                          error={formErrors.email}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="modal-phone" className="block text-sm font-medium text-ink-300 mb-1">Phone *</label>
                        <Input
                          id="modal-phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 97117 00199"
                          error={formErrors.phone}
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-company" className="block text-sm font-medium text-ink-300 mb-1">Company *</label>
                        <Input
                          id="modal-company"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Acme Inc."
                          error={formErrors.company}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="modal-industry" className="block text-sm font-medium text-ink-300 mb-1">Industry *</label>
                      <div className="relative">
                        <select
                          id="modal-industry"
                          value={formData.industry}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleIndustryChange(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none bg-no-repeat bg-right pr-10 cursor-pointer"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238faeff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
                        >
                          <option value="">Select your industry</option>
                          {INDUSTRIES.map((ind) => (
                            <option key={ind.id} value={ind.id}>{ind.label}</option>
                          ))}
                        </select>
                        {formErrors.industry && (
                          <p className="mt-1 text-sm text-rose-400">{formErrors.industry}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="modal-message" className="block text-sm font-medium text-ink-300 mb-1">Message *</label>
                      <Textarea
                        id="modal-message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us about your business and what you're looking for..."
                        rows={4}
                        error={formErrors.message}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-ink-500">
                      By submitting, you agree to our Privacy Policy and Terms of Service.
                    </p>
                  </form>
                )}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Meeting Scheduler Modal - Redirects to Google Meet */}
      <AnimatePresence>
        {showMeetingScheduler && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMeetingScheduler(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="w-full max-w-md" tone="strong">
                <div className="text-center py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Schedule a Meeting</h2>
                  <p className="text-ink-300 mb-6">Book a 30-minute Google Meet call with our team to discuss how Azolik can automate your business.</p>
                  <a
                    href="https://meet.google.com/azolik-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button size="lg" className="gap-2 w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600">
                      <Send className="h-4 w-4" />
                      Open Google Meet Scheduler
                    </Button>
                  </a>
                  <p className="mt-4 text-sm text-ink-500">Or email us directly at <a href="mailto:aarishvimal1@gmail.com" className="text-brand-400 hover:underline">aarishvimal1@gmail.com</a></p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMeetingScheduler(false)}
                    className="mt-4 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}