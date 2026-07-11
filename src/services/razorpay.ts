// Razorpay Service - Real Payment Integration
import { razorpayConfig, shopifyConfig } from "@/config/app";

// Types
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: "captured" | "failed" | "refunded" | "pending";
  method: "card" | "netbanking" | "wallet" | "upi" | "emi";
  order_id: string;
  invoice_id?: string;
  international: boolean;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

export interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt?: string;
  status: "processed" | "pending" | "failed";
  speed_processed?: string;
  speed_requested?: string;
  created_at: number;
}

export interface CreateOrderRequest {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
  partial_payment?: boolean;
  first_payment_min_amount?: number;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Razorpay Service Class
class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private baseUrl = "https://api.razorpay.com/v1";
  private razorpayInstance: any = null;

  constructor() {
    this.keyId = razorpayConfig.keyId;
    this.keySecret = razorpayConfig.keySecret;
  }

  // Initialize Razorpay checkout (client-side)
  async loadRazorpayScript(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if ((window as any).Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create order on server (via Firebase Function or backend)
  async createOrder(orderData: CreateOrderRequest): Promise<RazorpayOrder> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || "Failed to create order");
    }

    return response.json();
  }

  // Verify payment signature
  async verifyPayment(verification: PaymentVerificationRequest): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
      body: JSON.stringify(verification),
    });

    return response.ok;
  }

  // Fetch payment details
  async getPayment(paymentId: string): Promise<RazorpayPayment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payment");
    }

    return response.json();
  }

  // Fetch order details
  async getOrder(orderId: string): Promise<RazorpayOrder> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      headers: {
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    return response.json();
  }

  // Create refund
  async createRefund(paymentId: string, amount?: number, notes?: Record<string, string>): Promise<RazorpayRefund> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: amount ? amount * 100 : undefined, // Convert to paise
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || "Failed to create refund");
    }

    return response.json();
  }

  // Get all refunds for a payment
  async getRefunds(paymentId: string): Promise<RazorpayRefund[]> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refunds`, {
      headers: {
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch refunds");
    }

    const data = await response.json();
    return data.items;
  }

  // Client-side: Open Razorpay Checkout
  openCheckout(options: {
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    theme?: {
      color: string;
    };
    modal?: {
      ondismiss: () => void;
    };
    handler: (response: any) => void;
  }): void {
    if (typeof window === "undefined") return;

    const rzp = new (window as any).Razorpay({
      key: this.keyId,
      amount: options.amount,
      currency: options.currency,
      order_id: options.orderId,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      theme: options.theme || { color: "#5f76ff" },
      modal: options.modal,
      handler: options.handler,
    });

    rzp.open();
  }

  // Create payment link
  async createPaymentLink(data: {
    amount: number;
    currency: string;
    description: string;
    customer: {
      name: string;
      email: string;
      contact: string;
    };
    notify: {
      sms: boolean;
      email: boolean;
    };
    reminder_enable: boolean;
    notes?: Record<string, string>;
  }): Promise<{ id: string; short_url: string }> {
    const response = await fetch(`${this.baseUrl}/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || "Failed to create payment link");
    }

    return response.json();
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Only works in Node.js environment (Firebase Functions)
    if (typeof window !== "undefined") {
      console.warn("Webhook verification should run server-side");
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  }
}

// Utility functions
export async function createPaymentOrder(
  businessId: string,
  customerId: string,
  amount: number,
  currency: string,
  description: string,
  metadata: Record<string, any>
): Promise<{ orderId: string; amount: number }> {
  const razorpay = new RazorpayService();
  const order = await razorpay.createOrder({
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    notes: {
      businessId,
      customerId,
      description,
      ...metadata,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
  };
}

export async function verifyPaymentAndUpdateOrder(
  businessId: string,
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const razorpay = new RazorpayService();
  const isValid = await razorpay.verifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  });

  if (isValid) {
    // Update order status in Firestore would go here
    return true;
  }

  return false;
}

export async function switchIndustry(industry: string) {
  // This would be handled by the engine
}

export const INDUSTRIES_META: Record<string, { name: string; emoji: string; tagline: string }> = {
  bakery: { name: "Bakery", emoji: "🥖", tagline: "Cakes, bread & pastries" },
  dental: { name: "Dental Clinic", emoji: "🦷", tagline: "Appointments & patient care" },
  gym: { name: "Gym & Fitness", emoji: "💪", tagline: "Memberships & training" },
  restaurant: { name: "Restaurant", emoji: "🍽️", tagline: "Orders & reservations" },
  ecommerce: { name: "E-commerce", emoji: "📦", tagline: "Products & support" },
  agency: { name: "Creative Agency", emoji: "🎨", tagline: "Leads & projects" },
};

export const DEPARTMENTS = ["support", "sales", "marketing", "finance", "operations", "hr"];

export const workforceEngine = {
  start: () => {},
  stop: () => {},
};

const razorpayService = new RazorpayService();
export { razorpayService };

export { INDUSTRIES_META };