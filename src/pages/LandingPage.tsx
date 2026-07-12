// Landing Page - The entry point before authentication
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Bot, 
  Zap, 
  Shield, 
  Globe, 
  Clock,
  Building2,
  MessageSquare,
  BarChart3,
  Wallet,
  Cpu,
  Zap as ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

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
  { icon: Users, title: "5 Minutes to Go Live", desc: "Sign up. Tell us about your business. Your AI workforce starts working. No engineers needed." },
];

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[200px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/05 blur-[200px] animate-pulse" style={{ animationDelay: '4s' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.015%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_8px_24px_-6px_rgba(95,131,255,0.6)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">Azolik</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            Sign in
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
                <span className="font-semibold">Now live: AI Workforce OS</span>
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.05] mb-6"
              >
                The operating system for a modern
                <br />
                <span className="bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent">
                  AI-powered company
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl text-ink-300 max-w-2xl mx-auto leading-relaxed text-balance"
              >
                Six AI departments. Forty-four specialized agents. One intelligent workspace that runs your business while you sleep.
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

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-ink-500 text-sm"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                SOC 2 Certified
              </span>
              <span className="flex items-center gap-2">
                <ZapIcon className="h-4 w-4 text-emerald-500" />
                99.9% Uptime
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                1,000+ Businesses
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                5-min Setup
              </span>
            </motion.div>
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
                Six Departments. One Intelligent Workforce.
              </h2>
              <p className="mt-3 text-lg text-ink-300 max-w-2xl mx-auto">
                Each department is a team of specialized AI agents that collaborate, hand off tasks, and execute real work — just like a human team.
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
                  Ready to hire your AI workforce?
                </h2>
                <p className="text-lg text-ink-300 mb-8 max-w-lg mx-auto">
                  Join 1,000+ businesses running on Azolik. Start free, cancel anytime.
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
              <p className="text-sm text-ink-400">The operating system for a modern AI-powered company.</p>
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
</footer>
      </div>
  );
}