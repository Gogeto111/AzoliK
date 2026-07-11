// Shopify Integration Service - Real Shopify API Integration
import { shopifyConfig } from "@/config/app";
import { getDoc, doc, updateDoc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: "active" | "archived" | "draft";
  tags: string;
  variants: ShopifyVariant[];
  images: Array<{ id: number; src: string; alt: string }>;
  created_at: string;
  updated_at: string;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: "deny" | "continue";
  compare_at_price?: string;
  fulfillment_service: "manual" | "shopify";
  inventory_management: "shopify" | "none";
  option1?: string;
  option2?: string;
  option3?: string;
  taxable: boolean;
  barcode?: string;
  grams: number;
  weight: number;
  weight_unit: string;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
}

export interface ShopifyOrder {
  id: number;
  email: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  number: number;
  note?: string;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_weight: number;
  total_tax: string;
  taxes_included: boolean;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  total_line_items_price: string;
  cart_token: string;
  buyer_accepts_marketing: boolean;
  name: string;
  referring_site: string;
  landing_site: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
  total_price_usd: string;
  checkout_token: string;
  reference: string;
  source_identifier: string;
  source_url: string;
  processed_at: string;
  device_id: number | null;
  phone: string | null;
  customer_locale: string;
  app_id: number;
  browser_ip: string;
  landing_site_ref: string;
  order_number: number;
  discount_applications: any[];
  discount_codes: any[];
  note_attributes: any[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: number;
  source_name: string;
  fulfillment_status: string | null;
  tags: string;
  contact_email: string;
  presentment_currency: string;
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  line_items: ShopifyLineItem[];
  fulfillments: any[];
  refunds: any[];
  total_tip_received: string;
  original_total_duties_set: boolean;
}

export interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string | null;
  vendor: string;
  fulfillment_service: string;
  product_id: number;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: any[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string | null;
  price_set: { shop_money: { amount: string; currency_code: string }; presentment_money: { amount: string; currency_code: string } };
  total_discount_set: { shop_money: { amount: string; currency_code: string }; presentment_money: { amount: string; currency_code: string } };
  discount_allocations: any[];
  duties: any[];
  admin_graphql_api_id: string;
}

export interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
  admin_graphql_api_id: string;
}

export interface ShopifyWebhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  updated_at: string;
  format: "json" | "xml";
  fields: string[];
  metafield_namespaces: string[];
}

export class ShopifyService {
  private storeDomain: string;
  private accessToken: string;
  private apiVersion: string = "2024-01";

  constructor(storeDomain: string, accessToken: string) {
    this.storeDomain = storeDomain;
    this.accessToken = accessToken;
  }

  private get baseUrl(): string {
    return `https://${this.storeDomain}/admin/api/${this.apiVersion}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.message || `Shopify API error: ${response.status}`);
    }

    return response.json();
  }

  // ==================== PRODUCTS ====================

  async getProducts(options?: {
    limit?: number;
    page_info?: string;
    status?: "active" | "archived" | "draft";
    vendor?: string;
    product_type?: string;
  }): Promise<{ products: ShopifyProduct[]; nextPageInfo?: string }> {
    const params = new URLSearchParams({
      limit: (options?.limit || 50).toString(),
    });

    if (options?.status) params.append("status", options.status);
    if (options?.vendor) params.append("vendor", options.vendor);
    if (options?.product_type) params.append("product_type", options.product_type);
    if (options?.page_info) params.append("page_info", options.page_info);

    return this.request<{ products: ShopifyProduct[] }>(`/products.json?${params}`);
  }

  async getProduct(productId: number): Promise<ShopifyProduct> {
    const response = await this.request<{ product: ShopifyProduct }>(`/products/${productId}.json`);
    return response.product;
  }

  async createProduct(product: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
    const response = await this.request<{ product: ShopifyProduct }>("/products.json", {
      method: "POST",
      body: JSON.stringify({ product }),
    });
    return response.product;
  }

  async updateProduct(productId: number, product: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
    const response = await this.request<{ product: ShopifyProduct }>(`/products/${productId}.json`, {
      method: "PUT",
      body: JSON.stringify({ product }),
    });
    return response.product;
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.request(`/products/${productId}.json`, { method: "DELETE" });
  }

  // ==================== VARIANTS ====================

  async getVariants(productId: number): Promise<ShopifyVariant[]> {
    const response = await this.request<{ variants: ShopifyVariant[] }>(`/products/${productId}/variants.json`);
    return response.variants;
  }

  async getVariant(variantId: number): Promise<ShopifyVariant> {
    const response = await this.request<{ variant: ShopifyVariant }>(`/variants/${variantId}.json`);
    return response.variant;
  }

  async updateVariant(variantId: number, variant: Partial<ShopifyVariant>): Promise<ShopifyVariant> {
    const response = await this.request<{ variant: ShopifyVariant }>(`/variants/${variantId}.json`, {
      method: "PUT",
      body: JSON.stringify({ variant }),
    });
    return response.variant;
  }

  async updateVariantInventory(variantId: number, quantity: number): Promise<ShopifyVariant> {
    return this.updateVariant(variantId, { inventory_quantity: quantity });
  }

  // ==================== INVENTORY ====================

  async getInventoryLevels(locationId?: number): Promise<ShopifyInventoryLevel[]> {
    const response = await this.request<{ inventory_levels: ShopifyInventoryLevel[] }>(
      locationId ? `/inventory_levels.json?location_ids=${locationId}` : "/inventory_levels.json"
    );
    return response.inventory_levels;
  }

  async adjustInventoryLevel(inventoryItemId: number, locationId: number, availableAdjustment: number): Promise<ShopifyInventoryLevel> {
    const response = await this.request<{ inventory_level: ShopifyInventoryLevel }>(`/inventory_levels/adjust.json`, {
      method: "POST",
      body: JSON.stringify({
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available_adjustment: availableAdjustment,
      }),
    });
    return response.inventory_level;
  }

  async setInventoryLevel(inventoryItemId: number, locationId: number, available: number): Promise<ShopifyInventoryLevel> {
    const response = await this.request<{ inventory_level: ShopifyInventoryLevel }>(`/inventory_levels/set.json`, {
      method: "POST",
      body: JSON.stringify({
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available,
      }),
    });
    return response.inventory_level;
  }

  // ==================== ORDERS ====================

  async getOrders(options?: {
    limit?: number;
    status?: "open" | "closed" | "cancelled" | "any";
    financial_status?: "pending" | "authorized" | "partially_paid" | "paid" | "partially_refunded" | "refunded" | "voided";
    fulfillment_status?: "shipped" | "partial" | "unfulfilled" | "any";
    created_at_min?: string;
    created_at_max?: string;
    page_info?: string;
  }): Promise<{ orders: ShopifyOrder[]; nextPageInfo?: string }> {
    const params = new URLSearchParams({
      limit: (options?.limit || 50).toString(),
    });

    if (options?.status) params.append("status", options.status);
    if (options?.financial_status) params.append("financial_status", options.financial_status);
    if (options?.fulfillment_status) params.append("fulfillment_status", options.fulfillment_status);
    if (options?.created_at_min) params.append("created_at_min", options.created_at_min);
    if (options?.created_at_max) params.append("created_at_max", options.created_at_max);
    if (options?.page_info) params.append("page_info", options.page_info);

    return this.request<{ orders: ShopifyOrder[] }>(`/orders.json?${params}`);
  }

  async getOrder(orderId: number): Promise<ShopifyOrder> {
    const response = await this.request<{ order: ShopifyOrder }>(`/orders/${orderId}.json`);
    return response.order;
  }

  async createOrder(order: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
    const response = await this.request<{ order: ShopifyOrder }>("/orders.json", {
      method: "POST",
      body: JSON.stringify({ order }),
    });
    return response.order;
  }

  async updateOrder(orderId: number, order: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
    const response = await this.request<{ order: ShopifyOrder }>(`/orders/${orderId}.json`, {
      method: "PUT",
      body: JSON.stringify({ order }),
    });
    return response.order;
  }

  async fulfillOrder(orderId: number, fulfillment: {
    location_id: number;
    tracking_number?: string;
    tracking_company?: string;
    tracking_url?: string;
    notify_customer?: boolean;
    line_items?: Array<{ id: number; quantity: number }>;
  }): Promise<any> {
    return this.request<any>(`/orders/${orderId}/fulfillments.json`, {
      method: "POST",
      body: JSON.stringify({ fulfillment }),
    });
  }

  // ==================== CUSTOMERS ====================

  async getCustomers(options?: {
    limit?: number;
    since_id?: number;
  }): Promise<{ customers: any[] }> {
    const params = new URLSearchParams({
      limit: (options?.limit || 50).toString(),
    });
    if (options?.since_id) params.append("since_id", options.since_id.toString());
    return this.request<{ customers: any[] }>(`/customers.json?${params}`);
  }

  async createCustomer(customer: any): Promise<any> {
    return this.request<any>("/customers.json", {
      method: "POST",
      body: JSON.stringify({ customer }),
    });
  }

  // ==================== WEBHOOKS ====================

  async getWebhooks(): Promise<{ webhooks: any[] }> {
    return this.request<{ webhooks: any[] }>("/webhooks.json");
  }

  async createWebhook(webhook: {
    address: string;
    topic: string;
    format: "json" | "xml";
    metafield_namespaces?: string[];
  }): Promise<any> {
    return this.request<any>("/webhooks.json", {
      method: "POST",
      body: JSON.stringify({ webhook }),
    });
  }

  async deleteWebhook(webhookId: number): Promise<void> {
    await this.request(`/webhooks/${webhookId}.json`, { method: "DELETE" });
  }

  // ==================== LOCATIONS ====================

  async getLocations(): Promise<{ locations: any[] }> {
    return this.request<{ locations: any[] }>("/locations.json");
  }

  // ==================== HELPER METHODS ====================

  // Sync inventory from Shopify to local database
  async syncInventoryToFirestore(businessId: string, db: any): Promise<number> {
    let syncedCount = 0;
    let pageInfo: string | undefined;

    do {
      const { products, nextPageInfo } = await this.getProducts({ limit: 250, page_info: pageInfo });
      
      for (const product of products) {
        for (const variant of product.variants) {
          if (variant.inventory_management === "shopify") {
            const inventoryRef = doc(db, "businesses", businessId, "inventory", variant.sku);
            await setDoc(inventoryRef, {
              name: product.title,
              description: product.body_html,
              sku: variant.sku,
              category: product.product_type,
              costPrice: parseFloat(variant.price) * 0.6, // Estimate
              sellingPrice: parseFloat(variant.price),
              stock: variant.inventory_quantity,
              minStock: 10,
              supplier: product.vendor,
              barcode: variant.barcode,
              images: product.images.map(img => img.src),
              variants: product.variants.map(v => ({
                id: v.id.toString(),
                name: v.title,
                price: parseFloat(v.price),
                stock: v.inventory_quantity,
              })),
              status: product.status === "active" ? "active" : "inactive",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }, { merge: true });
            
            syncedCount++;
          }
        }
      }
      pageInfo = nextPageInfo;
    } while (pageInfo);

    return syncedCount;
  }

  // Sync orders from Shopify to local database
  async syncOrdersToFirestore(businessId: string, db: any): Promise<number> {
    let syncedCount = 0;
    let pageInfo: string | undefined;

    do {
      const { orders, nextPageInfo } = await this.getOrders({ limit: 250, page_info: pageInfo });
      
      for (const order of orders) {
        // Check if order already exists
        const existingQuery = query(
          collection(db, "businesses", businessId, "orders"),
          where("shopifyOrderId", "==", order.id.toString())
        );
        const existing = await getDocs(existingQuery);
        
        if (existing.empty) {
          await addDoc(collection(db, "businesses", businessId, "orders"), {
            shopifyOrderId: order.id,
            orderNumber: order.name,
            email: order.email,
            customerName: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim(),
            customerPhone: order.customer?.phone,
            status: order.financial_status,
            fulfillmentStatus: order.fulfillment_status,
            items: order.line_items.map(item => ({
              productId: item.product_id,
              variantId: item.variant_id,
              title: item.title,
              quantity: item.quantity,
              price: parseFloat(item.price),
              total: parseFloat(item.price) * item.quantity,
              sku: item.sku,
            })),
            subtotal: parseFloat(order.subtotal_price),
            tax: parseFloat(order.total_tax),
            total: parseFloat(order.total_price),
            currency: order.currency,
            createdAt: new Date(order.created_at).getTime(),
            updatedAt: new Date(order.updated_at).getTime(),
          });
        } else {
          // Update existing order
          const orderDoc = existing.docs[0];
          await updateDoc(orderDoc.ref, {
            status: order.financial_status,
            fulfillmentStatus: order.fulfillment_status,
            updatedAt: new Date(order.updated_at).getTime(),
          });
        }
        
        syncedCount++;
      }
      
      pageInfo = nextPageInfo;
    } while (pageInfo);

    return syncedCount;
  }
}

// Helper functions
function getDepartmentName(type: string): string {
  const names: Record<string, string> = {
    support: "Support",
    sales: "Sales",
    marketing: "Marketing",
    operations: "Operations",
    finance: "Finance",
    hr: "HR",
  };
  return names[type] || type;
}

function getDepartmentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    support: "Customer support, FAQs, order tracking",
    sales: "Lead management, quotes, follow-ups, payments",
    marketing: "Social media, emails, campaigns, content",
    operations: "Inventory, orders, fulfillment, vendors",
    finance: "Invoices, expenses, reconciliation, reports",
    hr: "Hiring, onboarding, attendance, payroll",
  };
  return descriptions[type] || "";
}

function getDepartmentTools(type: string): string[] {
  const tools: Record<string, string[]> = {
    support: ["whatsapp", "faqs", "inventory", "orders", "payments", "calendar_book"],
    sales: ["crm", "gmail", "payments", "calendar", "hubspot", "zoho"],
    marketing: ["social", "email_marketing", "calendar", "slack", "notion", "shopify"],
    finance: ["gmail", "sheets", "invoices", "expenses", "razorpay", "stripe"],
    operations: ["inventory", "orders", "shopify", "woo", "slack", "notion"],
    hr: ["gmail", "calendar", "sheets", "slack", "notion", "outlook"],
  };
  return tools[type] || [];
}

// Factory function
export function createShopifyService(storeDomain: string, accessToken: string): ShopifyService {
  return new ShopifyService(storeDomain, accessToken);
}

export default ShopifyService;