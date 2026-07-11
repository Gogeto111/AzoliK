// RazorpayIntegration - Minimal Working Version
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Zap, Shield, ExternalLink, Copy, CheckCircle, Loader2, AlertCircle, RefreshCw, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { razorpayService, createPaymentOrder } from "@/services/razorpay";

interface PaymentOrderRequest {
  amount: number;
  currency: string;
  description: string;
  customer: { name: string; email: string; contact: string };
  notes?: Record<string, string>;
}

export function RazorpayIntegration() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    currency: "INR",
    description: "",
    customer: { name: "", email: "", contact: "" },
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (profile?.businessId) {
      setOrders([]);
    }
  }, [profile]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.businessId) return;

    setCreating(true);
    try {
      const { createPaymentOrder } = await import("@/services/razorpay");
      await createPaymentOrder(
        "profile.businessId",
        "profile.uid",
        formData.amount * 100,
        formData.currency,
        formData.description,
        { customerName: formData.customer.name, customerEmail: formData.customer.email }
      );
      setShowCreateModal(false);
      setFormData({ amount: 0, currency: "INR", description: "", customer: { name: "", email: "", contact: "" } });
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create payment order.");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(console.error);
    alert("Copied to clipboard!");
  };

  if (!profile?.businessId) {
    return (
      <GlassCard className="p-8 text-center">
        <Shield className="h-12 w-12 text-ink-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Connect Your Business</h3>
        <p className="text-ink-400">Complete onboarding to enable payment integrations.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Razorpay Payments</h2>
          <p className="text-ink-400 mt-1">Create payment links, track orders, and manage refunds</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Zap className="h-4 w-4" /> Create Payment Link
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CreditCard} label="Total Orders" value={0} color="brand" />
        <StatCard icon={CheckCircle} label="Paid" value={0} color="emerald" />
        <StatCard icon={AlertCircle} label="Pending" value={0} color="amber" />
        <StatCard icon={Shield} label="Revenue" value="₹0" color="cyan" />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-medium text-ink-300">Order ID</th>
                <th className="text-left p-4 font-medium text-ink-300">Customer</th>
                <th className="text-left p-4 font-medium text-ink-300">Amount</th>
                <th className="text-left p-4 font-medium text-ink-300">Status</th>
                <th className="text-left p-4 font-medium text-ink-300">Created</th>
                <th className="text-left p-4 font-medium text-ink-300">Actions</th>
              </tr>
            </thead>
<tbody>
                <tr>
                  <td colSpan={6} className="text-center py-8 text-ink-400">
                    No orders yet. Create your first payment link!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md"
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Create Payment Link</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="text-ink-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <form onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!formData.amount) return;
                    setCreating(true);
                    try {
                      const { createPaymentOrder } = await import("@/services/razorpay");
                      await createPaymentOrder("profile.businessId", "profile.uid", formData.amount * 100, formData.currency, formData.description, {
                        customerName: formData.customer.name,
                        customerEmail: formData.customer.email,
                      });
                      setShowCreateModal(false);
                      setFormData({ amount: 0, currency: "INR", description: "", customer: { name: "", email: "", contact: "" } });
                    } catch (error) {
                      console.error("Failed to create order:", error);
                      alert("Failed to create payment order.");
                    } finally {
                      setCreating(false);
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-300 mb-2">Amount (₹)</label>
                      <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} placeholder="1000" className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" required min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-300 mb-2">Currency</label>
                      <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-white focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none bg-no-repeat bg-right pr-10">
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                        <option value="GBP">£ GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-300 mb-2">Description</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Payment for order #1234" className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none transition-all" required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-ink-300 mb-2">Customer Name</label>
                        <input type="text" value={formData.customer.name} onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })} placeholder="John Doe" className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-300 mb-2">Customer Email</label>
                        <input type="email" value={formData.customer.email} onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })} placeholder="john@example.com" className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-300 mb-2">Customer Phone</label>
                        <input type="tel" value={formData.customer.contact} onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, contact: e.target.value } })} placeholder="+91 98765 43210" className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                      <Button variant="secondary" onClick={() => { setShowCreateModal(false); setFormData({ amount: 0, currency: "INR", description: "", customer: { name: "", email: "", contact: "" } }); }}>Cancel</Button>
                      <Button variant="primary" type="submit" disabled={creating} className="gap-1">
                        {creating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-1" />
                            Create Payment Link
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
    cyan: "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
  };

  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${colorMap[color]}`}>
        <CreditCard className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 text-[22px] font-semibold text-white">{value}</div>
      </div>
    </GlassCard>
  );
}

function getStatusTone(status: string): "emerald" | "amber" | "rose" | "brand" | "muted" {
  switch (status) {
    case "paid": return "emerald";
    case "created": return "amber";
    case "failed": return "rose";
    default: return "muted";
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(console.error);
  alert("Copied to clipboard!");
}