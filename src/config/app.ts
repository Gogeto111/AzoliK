// Centralized app configuration for Azolik

// API Config (set via environment variables)
export const apiConfig = {
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
    keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || "",
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || "",
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
  },
  shopify: {
    storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "",
    accessToken: import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || "",
  },
  woocommerce: {
    consumerKey: import.meta.env.VITE_WC_CONSUMER_KEY || "",
    consumerSecret: import.meta.env.VITE_WC_CONSUMER_SECRET || "",
    storeUrl: import.meta.env.VITE_WC_STORE_URL || "",
  },
  zoho: {
    clientId: import.meta.env.VITE_ZOHO_CLIENT_ID || "",
    clientSecret: import.meta.env.VITE_ZOHO_CLIENT_SECRET || "",
  },
  hubspot: {
    apiKey: import.meta.env.VITE_HUBSPOT_API_KEY || "",
  },
  slack: {
    clientId: import.meta.env.VITE_SLACK_CLIENT_ID || "",
    clientSecret: import.meta.env.VITE_SLACK_CLIENT_SECRET || "",
  },
  notion: {
    clientId: import.meta.env.VITE_NOTION_CLIENT_ID || "",
    clientSecret: import.meta.env.VITE_NOTION_CLIENT_SECRET || "",
  },
};

export const razorpayConfig = apiConfig.razorpay;
export const shopifyConfig = apiConfig.shopify;

// App Config
export const appConfig = {
  name: "Azolik",
  version: "1.0.0",
  supportEmail: "support@azolik.com",
  onboardingQuestions: [
    {
      id: "businessType",
      text: "What type of business do you run?",
      type: "select",
      required: true,
      options: [
        { value: "bakery", label: "🍞 Bakery / Cafe" },
        { value: "restaurant", label: "🍽️ Restaurant" },
        { value: "retail", label: "🛍️ Retail / E-commerce" },
        { value: "clinic", label: "🏥 Clinic / Medical" },
        { value: "gym", label: "💪 Gym / Fitness" },
        { value: "salon", label: "💇 Salon / Spa" },
        { value: "services", label: "🔧 Services / Repairs" },
        { value: "consulting", label: "💼 Consulting / Agency" },
        { value: "other", label: "📦 Other" },
      ],
    },
    {
      id: "businessName",
      text: "What's your business name?",
      type: "text",
      required: true,
      placeholder: "e.g., Butter & Crust Bakery",
    },
    {
      id: "ownerName",
      text: "What's your name?",
      type: "text",
      required: true,
      placeholder: "e.g., Aarish Sharma",
    },
    {
      id: "phone",
      text: "WhatsApp Business number?",
      type: "tel",
      required: true,
      placeholder: "+91 98765 43210",
    },
    {
      id: "address",
      text: "Business address?",
      type: "textarea",
      required: false,
      placeholder: "123 Main St, City, State, PIN",
    },
    {
      id: "currency",
      text: "Primary currency?",
      type: "select",
      required: true,
      options: [
        { value: "INR", label: "₹ INR (India)" },
        { value: "USD", label: "$ USD (USA)" },
        { value: "EUR", label: "€ EUR (Europe)" },
        { value: "GBP", label: "£ GBP (UK)" },
      ],
    },
    {
      id: "timezone",
      text: "Timezone?",
      type: "select",
      required: true,
      options: [
        { value: "Asia/Kolkata", label: "IST (UTC+5:30) - India" },
        { value: "America/New_York", label: "EST (UTC-5) - New York" },
        { value: "America/Los_Angeles", label: "PST (UTC-8) - Los Angeles" },
        { value: "Europe/London", label: "GMT (UTC+0) - London" },
        { value: "Asia/Dubai", label: "GST (UTC+4) - Dubai" },
        { value: "Asia/Singapore", label: "SGT (UTC+8) - Singapore" },
        { value: "Australia/Sydney", label: "AEST (UTC+10) - Sydney" },
      ],
    },
    {
      id: "integrations",
      text: "Which tools do you already use? (Select all that apply)",
      type: "multiselect",
      required: false,
      options: [
        { value: "razorpay", label: "💳 Razorpay" },
        { value: "stripe", label: "💳 Stripe" },
        { value: "google_sheets", label: "📊 Google Sheets" },
        { value: "google_calendar", label: "📅 Google Calendar" },
        { value: "gmail", label: "📧 Gmail" },
        { value: "shopify", label: "🛍️ Shopify" },
        { value: "woocommerce", label: "🛒 WooCommerce" },
        { value: "zoho", label: "📋 Zoho CRM" },
        { value: "hubspot", label: "🎯 HubSpot" },
        { value: "whatsapp", label: "💬 WhatsApp Business" },
        { value: "slack", label: "💬 Slack" },
        { value: "notion", label: "📝 Notion" },
      ],
    },
    {
      id: "departments",
      text: "Which departments do you want to activate?",
      type: "multiselect",
      required: true,
      options: [
        { value: "support", label: "🎧 Support - Customer messages, FAQs, orders" },
        { value: "sales", label: "💰 Sales - Leads, quotes, follow-ups, payments" },
        { value: "marketing", label: "📈 Marketing - Social posts, emails, campaigns" },
        { value: "finance", label: "💸 Finance - Invoices, expenses, reconciliation" },
        { value: "operations", label: "⚙️ Operations - Inventory, orders, fulfillment" },
        { value: "hr", label: "👥 HR - Hiring, onboarding, team management" },
      ],
    },
  ],
};

// Types
export type BusinessType = 
  | "bakery" | "restaurant" | "retail" | "clinic" 
  | "gym" | "salon" | "services" | "consulting" | "other";

export type Currency = "INR" | "USD" | "EUR" | "GBP";

export type Timezone = 
  | "Asia/Kolkata" | "America/New_York" | "America/Los_Angeles" 
  | "Europe/London" | "Asia/Dubai" | "Asia/Singapore" | "Australia/Sydney";

export interface OnboardingData {
  businessType: BusinessType;
  businessName: string;
  ownerName: string;
  phone: string;
  address?: string;
  currency: Currency;
  timezone: Timezone;
  integrations: string[];
  departments: string[];
}

export interface Integration {
  id: string;
  name: string;
  category: "payment" | "communication" | "crm" | "ecommerce" | "productivity";
  connected: boolean;
  config?: Record<string, any>;
  lastSync?: number;
  status: "connected" | "disconnected" | "error" | "syncing";
}

export const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: "razorpay", name: "Razorpay", category: "payment", connected: false, status: "disconnected" },
  { id: "stripe", name: "Stripe", category: "payment", connected: false, status: "disconnected" },
  { id: "google_sheets", name: "Google Sheets", category: "productivity", connected: false, status: "disconnected" },
  { id: "google_calendar", name: "Google Calendar", category: "productivity", connected: false, status: "disconnected" },
  { id: "gmail", name: "Gmail", category: "communication", connected: false, status: "disconnected" },
  { id: "whatsapp", name: "WhatsApp Business", category: "communication", connected: false, status: "disconnected" },
  { id: "shopify", name: "Shopify", category: "ecommerce", connected: false, status: "disconnected" },
  { id: "woocommerce", name: "WooCommerce", category: "ecommerce", connected: false, status: "disconnected" },
  { id: "zoho", name: "Zoho CRM", category: "crm", connected: false, status: "disconnected" },
  { id: "hubspot", name: "HubSpot", category: "crm", connected: false, status: "disconnected" },
  { id: "slack", name: "Slack", category: "communication", connected: false, status: "disconnected" },
  { id: "notion", name: "Notion", category: "productivity", connected: false, status: "disconnected" },
];