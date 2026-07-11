import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Razorpay from "razorpay";
import * as Stripe from "stripe";
import axios from "axios";
import { z } from "zod";
import * as crypto from "crypto";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// INITIALIZATION
// ============================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// ============================================
// SCHEMAS (Zod for validation)
// ============================================

const CreateBusinessSchema = z.object({
  businessType: z.string(),
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().optional(),
  currency: z.string().default("INR"),
  timezone: z.string().default("Asia/Kolkata"),
  integrations: z.array(z.string()).default([]),
  departments: z.array(z.string()).default([]),
});

const CreateOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  receipt: z.string(),
  notes: z.record(z.string()).optional(),
});

const BusinessDiscoverySchema = z.object({
  phone: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
});

const SyncIntegrationSchema = z.object({
  businessId: z.string(),
  integration: z.enum(["shopify", "woocommerce", "razorpay", "stripe", "google_sheets", "gmail", "calendar", "hubspot", "zoho"]),
  credentials: z.record(z.any()),
});

// ============================================
// AUTH TRIGGERS
// ============================================

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const profile = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    phoneNumber: user.phoneNumber || "",
    businessId: null,
    onboardingComplete: false,
    onboardingStep: 0,
    role: "owner",
    preferences: {
      notifications: { email: true, push: true, sms: false },
      theme: "dark",
      language: "en",
      timezone: "Asia/Kolkata",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("users").doc(user.uid).set(profile);
  
  // Create default notification
  await db.collection("users").doc(user.uid).collection("notifications").add({
    type: "info",
    title: "Welcome to Azolik!",
    message: "Your AI workforce is ready to be built. Let's get started.",
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  // Clean up user data
  const batch = db.batch();
  
  // Delete user document
  batch.delete(db.collection("users").doc(user.uid));
  
  // Delete user's businesses (cascade)
  const businessesSnapshot = await db.collection("businesses")
    .where("ownerId", "==", user.uid)
    .get();
  
  businessesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
});

// ============================================
// BUSINESS DISCOVERY (AI-powered)
// ============================================

export const discoverBusiness = functions.https.onCall(async (data, context) => {
  // Verify auth
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { phone, businessName, address } = BusinessDiscoverySchema.parse(data);
  
  const results = await Promise.allSettled([
    searchGoogleMaps(phone, businessName, address),
    searchSocialProfiles(phone, businessName),
    searchBusinessListings(phone, businessName, address),
    searchWebsiteMetadata(phone, businessName),
  ]);

  const aggregated = aggregateDiscoveryResults(results);
  
  return {
    success: true,
    data: aggregated,
  };
});

async function searchGoogleMaps(phone: string, businessName?: string, address?: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    let query = businessName || "";
    if (phone) query += ` ${phone}`;
    if (address) query += ` ${address}`;

    const response = await axios.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json", {
      params: {
        input: query,
        inputtype: "textquery",
        fields: "place_id,name,formatted_address,formatted_phone_number,website,rating,reviews,photos,opening_hours,types,geometry",
        key: apiKey,
      },
    });

    if (response.data.candidates?.length > 0) {
      const place = response.data.candidates[0];
      const details = await getPlaceDetails(place.place_id, apiKey);
      return { source: "google_maps", data: { ...place, ...details } };
    }
    return null;
  } catch (error) {
    console.error("Google Maps search error:", error);
    return null;
  }
}

async function getPlaceDetails(placeId: string, apiKey: string) {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "name,formatted_address,formatted_phone_number,website,rating,reviews,photos,opening_hours,types,geometry,price_level,url,editorial_summary",
        key: apiKey,
      },
    });
    return response.data.result;
  } catch {
    return null;
  }
}

async function searchSocialProfiles(phone: string, businessName?: string) {
  // Instagram/Facebook search via Meta Graph API
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken || !businessName) return null;

  try {
    const response = await axios.get("https://graph.facebook.com/v18.0/search", {
      params: {
        q: businessName,
        type: "page",
        fields: "name,about,phone,website,location,hours,rating_count,overall_star_rating,photos,cover",
        access_token: accessToken,
      },
    });
    return { source: "meta", data: response.data.data?.[0] || null };
  } catch {
    return null;
  }
}

async function searchBusinessListings(phone: string, businessName?: string, address?: string) {
  // JustDial, IndiaMART, etc. - would need specific API access
  // For now, return mock structure
  return null;
}

async function searchWebsiteMetadata(phone: string, businessName?: string) {
  // Search for website via Google Custom Search or Bing
  // Extract metadata from found website
  return null;
}

function aggregateDiscoveryResults(results: PromiseSettledResult<any>[]) {
  const data: any = {
    name: null,
    type: null,
    address: null,
    phone: null,
    email: null,
    website: null,
    hours: null,
    rating: null,
    reviewsCount: null,
    photos: [],
    description: null,
    categories: [],
    confidence: 0,
  };

  let sourcesFound = 0;
  
  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value?.data) {
      sourcesFound++;
      const sourceData = result.value.data;
      
      if (sourceData.name && !data.name) data.name = sourceData.name;
      if (sourceData.formatted_address && !data.address) data.address = sourceData.formatted_address;
      if (sourceData.formatted_phone_number && !data.phone) data.phone = sourceData.formatted_phone_number;
      if (sourceData.website && !data.website) data.website = sourceData.website;
      if (sourceData.rating && !data.rating) data.rating = sourceData.rating;
      if (sourceData.reviews?.length && !data.reviewsCount) data.reviewsCount = sourceData.reviews.length;
      if (sourceData.photos?.length && !data.photos.length) {
        data.photos = sourceData.photos.slice(0, 10).map((p: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
      }
      if (sourceData.opening_hours?.weekday_text && !data.hours) {
        data.hours = sourceData.opening_hours.weekday_text;
      }
      if (sourceData.types && !data.categories.length) {
        data.categories = sourceData.types;
      }
    }
  });

  // Calculate confidence based on sources found
  data.confidence = Math.min(sourcesFound / 4, 1);

  return data;
}

// ============================================
// BUSINESS MANAGEMENT
// ============================================

export const createBusiness = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const validated = CreateBusinessSchema.parse(data);
  
  const businessId = `biz_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  const business = {
    id: businessId,
    name: validated.businessName,
    type: validated.businessType,
    ownerId: context.auth.uid,
    phone: validated.phone,
    address: validated.address,
    currency: validated.currency,
    timezone: validated.timezone,
    settings: {
      autoReply: true,
      businessHours: {
        enabled: true,
        timezone: validated.timezone,
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
      currencyFormat: "₹",
    },
    integrations: {},
    departments: validated.departments,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection("businesses").doc(businessId).set(business);
  
  // Update user profile with business ID
  await db.collection("users").doc(context.auth.uid).update({
    businessId,
    onboardingComplete: true,
    onboardingStep: 10,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create default departments
  for (const deptType of validated.departments) {
    await createDepartment(businessId, deptType);
  }

  return { success: true, businessId };
});

async function createDepartment(businessId: string, type: string): Promise<string> {
  const deptId = `dept_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const department: any = {
    id: deptId,
    businessId,
    type: type as any,
    name: getDepartmentName(type),
    description: getDepartmentDescription(type),
    enabled: true,
    agents: [],
    tools: getDepartmentTools(type),
    config: {},
    stats: {
      tasksToday: 0,
      completedToday: 0,
      pending: 0,
      avgResponseTime: 0,
    },
  };

  await db.collection("businesses").doc(businessId).collection("departments").doc(deptId).set(department);
  return deptId;
}

// ============================================
// PAYMENT INTEGRATIONS
// ============================================

export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const validated = CreateOrderSchema.parse(data);
  
  const order = await razorpay.orders.create({
    amount: Math.round(validated.amount * 100), // Convert to paise
    currency: validated.currency,
    receipt: validated.receipt,
    notes: validated.notes,
  });

  return {
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  };
});

export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid payment signature");
  }

  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  
  return {
    success: true,
    payment: {
      id: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
    },
  };
});

export const createStripePaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { amount, currency = "usd", metadata } = data;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return {
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
});

// ============================================
// WEBHOOKS
// ============================================

export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    res.status(400).send("Invalid signature");
    return;
  }

  const event = req.body;
  
  // Store webhook event
  await db.collection("webhook_events").add({
    source: "razorpay",
    event: event.event,
    payload: event.payload,
    processed: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Process specific events
  switch (event.event) {
    case "payment.captured":
      await handlePaymentCaptured(event.payload.payment.entity);
      break;
    case "payment.failed":
      await handlePaymentFailed(event.payload.payment.entity);
      break;
    case "refund.processed":
      await handleRefundProcessed(event.payload.refund.entity);
      break;
  }

  res.status(200).send("OK");
});

async function handlePaymentCaptured(payment: any) {
  const businessId = payment.notes?.businessId;
  const customerId = payment.notes?.customerId;
  
  if (businessId && customerId) {
    await db.collection("businesses").doc(businessId).collection("payments").add({
      razorpayPaymentId: payment.id,
      razorpayOrderId: payment.order_id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: "captured",
      method: payment.method,
      customerId,
      notes: payment.notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update invoice if linked
    if (payment.notes?.invoiceId) {
      await db.collection("businesses").doc(businessId).collection("invoices")
        .doc(payment.notes.invoiceId)
        .update({ status: "paid", paidAt: admin.firestore.FieldValue.serverTimestamp() });
    }
  }
}

async function handlePaymentFailed(payment: any) {
  await db.collection("failed_payments").add({
    ...payment,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleRefundProcessed(refund: any) {
  await db.collection("refunds").add({
    ...refund,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handleStripePaymentSucceeded(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handleStripePaymentFailed(event.data.object);
      break;
  }

  res.status(200).send("OK");
});

async function handleStripePaymentSucceeded(paymentIntent: any) {
  await db.collection("stripe_payments").add({
    ...paymentIntent,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleStripePaymentFailed(paymentIntent: any) {
  await db.collection("failed_stripe_payments").add({
    ...paymentIntent,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ============================================
// INTEGRATION SYNC
// ============================================

export const syncShopify = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { businessId, storeDomain, accessToken } = data;
  
  // Verify ownership
  const bizDoc = await db.collection("businesses").doc(businessId).get();
  if (!bizDoc.exists || bizDoc.data()?.ownerId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const shopify = axios.create({
    baseURL: `https://${storeDomain}/admin/api/2024-01`,
    headers: { "X-Shopify-Access-Token": accessToken },
  });

  let syncedCount = 0;
  let pageInfo: string | undefined;

  do {
    const response = await shopify.get("/products.json", {
      params: { limit: 250, page_info: pageInfo },
    });

    const products = response.data.products;
    
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.inventory_management === "shopify") {
          await db.collection("businesses").doc(businessId).collection("inventory").doc(variant.sku || variant.id.toString()).set({
            name: product.title,
            description: product.body_html,
            sku: variant.sku,
            category: product.product_type,
            costPrice: parseFloat(variant.price) * 0.6,
            sellingPrice: parseFloat(variant.price),
            stock: variant.inventory_quantity,
            minStock: 10,
            supplier: product.vendor,
            barcode: variant.barcode,
            images: product.images.map((img: any) => img.src),
            variants: product.variants.map((v: any) => ({
              id: v.id.toString(),
              name: v.title,
              price: parseFloat(v.price),
              stock: v.inventory_quantity,
            })),
            status: product.status === "active" ? "active" : "inactive",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          
          syncedCount++;
        }
      }
    }

    pageInfo = response.headers.link?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
    if (pageInfo) {
      const url = new URL(pageInfo);
      pageInfo = url.searchParams.get("page_info") || undefined;
    }
  } while (pageInfo);

  // Update integration status
  await db.collection("businesses").doc(businessId).update({
    "integrations.shopify.lastSync": admin.firestore.FieldValue.serverTimestamp(),
    "integrations.shopify.status": "connected",
  });

  return { success: true, syncedCount };
});

// ============================================
// AI AGENT EXECUTION
// ============================================

export const executeAgentTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  
  const { taskId, businessId, agentType, input } = data;
  
  // Verify access
  const bizDoc = await db.collection("businesses").doc(businessId).get();
  if (!bizDoc.exists || bizDoc.data()?.ownerId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const taskRef = db.collection("businesses").doc(businessId).collection("tasks").doc(taskId);
  const taskSnap = await taskRef.get();
  
  if (!taskSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Task not found");
  }

  const task = taskSnap.data()!;
  const results: any[] = [];
  
  for (const step of task.steps) {
    const stepResult = await executeAgentStep(step, businessId, input);
    results.push(stepResult);
    
    await taskRef.update({
      [`steps.${task.steps.indexOf(step)}.status`]: stepResult.success ? "completed" : "failed",
      [`steps.${task.steps.indexOf(step)}.output`]: stepResult.output,
      [`steps.${task.steps.indexOf(step)}.error`]: stepResult.error,
      [`steps.${task.steps.indexOf(step)}.completedAt`]: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (!stepResult.success && step.type !== "notification") {
      await taskRef.update({ status: "failed" });
      return { success: false, results };
    }
  }

  await taskRef.update({ 
    status: "completed", 
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, results };
});

async function executeAgentStep(step: any, businessId: string, input: any) {
  const { type, name } = step;
  
  switch (type) {
    case "tool_call":
      return await callTool(step.tool, businessId, step.input || input);
    case "handoff":
      return await handoffToHuman(businessId, step.input || input);
    case "approval":
      return await requestApproval(businessId, step.input || input);
    case "notification":
      return await sendNotification(businessId, step.input || input);
    case "data_fetch":
      return await fetchData(businessId, step.input || input);
    case "data_write":
      return await writeData(businessId, step.input || input);
    default:
      return { success: false, error: `Unknown step type: ${type}` };
  }
}

async function callTool(tool: string, businessId: string, input: any) {
  switch (tool) {
    case "send_whatsapp":
      return { success: true, output: { messageId: `msg_${Date.now()}` } };
    case "send_email":
      return { success: true, output: { messageId: `email_${Date.now()}` } };
    case "create_invoice":
      return { success: true, output: { invoiceId: `inv_${Date.now()}` } };
    case "create_order":
      return { success: true, output: { orderId: `ord_${Date.now()}` } };
    case "update_inventory":
      return { success: true, output: { updated: true } };
    case "create_lead":
      return { success: true, output: { leadId: `lead_${Date.now()}` } };
    default:
      return { success: false, error: `Unknown tool: ${tool}` };
  }
}

async function handoffToHuman(businessId: string, input: any) {
  await db.collection("businesses").doc(businessId).collection("escalations").add({
    ...input,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, output: { escalated: true } };
}

async function requestApproval(businessId: string, input: any) {
  await db.collection("businesses").doc(businessId).collection("approvals").add({
    ...input,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, output: { approvalRequested: true } };
}

async function sendNotification(businessId: string, input: any) {
  await db.collection("businesses").doc(businessId).collection("notifications").add({
    ...input,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, output: { notified: true } };
}

async function fetchData(businessId: string, input: any) {
  return { success: true, output: { data: {} } };
}

async function writeData(businessId: string, input: any) {
  return { success: true, output: { written: true } };
}

// ============================================
// SCHEDULED FUNCTIONS
// ============================================

export const dailyBusinessMetrics = functions.pubsub
  .schedule("0 6 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const businessesSnapshot = await db.collection("businesses").get();
    
    const batch = db.batch();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split("T")[0];

    for (const bizDoc of businessesSnapshot.docs) {
      const businessId = bizDoc.id;
      const departmentsSnapshot = await db.collection("businesses")
        .doc(businessId)
        .collection("departments")
        .get();

      let totalTasks = 0;
      let completedTasks = 0;
      let revenue = 0;
      let customersHelped = 0;

      for (const deptDoc of departmentsSnapshot.docs) {
        const dept = deptDoc.data();
        
        const tasksSnapshot = await db.collection("businesses")
          .doc(businessId)
          .collection("tasks")
          .where("department", "==", dept.type)
          .where("createdAt", ">=", today.getTime())
          .get();

        tasksSnapshot.docs.forEach(taskDoc => {
          totalTasks++;
          if (taskDoc.data().status === "completed") completedTasks++;
        });

        if (dept.type === "support") {
          const convSnapshot = await db.collection("businesses")
            .doc(businessId)
            .collection("conversations")
            .where("lastMessageAt", ">=", today.getTime())
            .get();
          customersHelped += convSnapshot.size;
        }

        if (dept.type === "sales") {
          const paymentsSnapshot = await db.collection("businesses")
            .doc(businessId)
            .collection("payments")
            .where("createdAt", ">=", today.getTime())
            .get();
          
          paymentsSnapshot.docs.forEach(payDoc => {
            revenue += payDoc.data().amount || 0;
          });
        }
      }

      const analyticsRef = db.collection("businesses")
        .doc(businessId)
        .collection("analytics")
        .doc(dateStr);

      batch.set(analyticsRef, {
        date: dateStr,
        revenueAssisted: revenue,
        customersHelped,
        appointmentsBooked: 0,
        ordersClosed: 0,
        hoursSaved: Math.round(completedTasks * 0.15),
        messagesAnswered: completedTasks,
        avgResponseTime: totalTasks > 0 ? Math.round(120 / totalTasks * 60) : 0,
        successRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
        automationsCompleted: completedTasks,
        departmentStats: {},
        topAgents: [],
      }, { merge: true });
    }

    await batch.commit();
    return null;
  });

export const cleanupOldData = functions.pubsub
  .schedule("0 2 * * 0") // Weekly on Sunday at 2 AM
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // Clean old webhook events
    const webhooksSnapshot = await db.collection("webhook_events")
      .where("createdAt", "<", thirtyDaysAgo)
      .limit(500)
      .get();
    
    const batch = db.batch();
    webhooksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    return null;
  });

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDepartmentName(type: string): string {
  const names: Record<string, string> = {
    support: "Support",
    sales: "Sales",
    marketing: "Marketing",
    finance: "Finance",
    operations: "Operations",
    hr: "HR",
  };
  return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function getDepartmentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    support: "Customer messages, FAQs, order tracking, escalations",
    sales: "Lead qualification, quotes, follow-ups, payment collection",
    marketing: "Content creation, social media, email campaigns, ads",
    finance: "Invoice processing, expense tracking, reconciliation",
    operations: "Inventory sync, order processing, vendor coordination",
    hr: "Hiring, onboarding, attendance, payroll, policies",
  };
  return descriptions[type] || "";
}

function getDepartmentTools(type: string): string[] {
  const tools: Record<string, string[]> = {
    support: ["whatsapp", "faqs", "inventory", "orders", "calendar_book", "gmail"],
    sales: ["crm", "gmail", "payments", "calendar", "hubspot", "zoho"],
    marketing: ["social", "email_marketing", "calendar", "slack", "notion", "shopify"],
    finance: ["gmail", "sheets", "invoices", "expenses", "razorpay", "stripe"],
    operations: ["inventory", "orders", "shopify", "woo", "slack", "notion"],
    hr: ["gmail", "calendar", "sheets", "slack", "notion", "outlook"],
  };
  return tools[type] || [];
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { db, auth };