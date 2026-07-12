// Firebase initialization and core services
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  type Auth, 
  GoogleAuthProvider, 
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  type Firestore,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: any;
let auth: any;
let db: any;
let storage: any;

export function initializeFirebase() {
  if (typeof window === "undefined") return { auth: null, db: null, storage: null };
  
  if (typeof getApps === 'function' && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  return { app };
}

// Initialize on client side
if (typeof window !== "undefined") {
  const { app: initializedApp } = initializeFirebase();
  app = initializedApp;
}

// Initialize services
if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Firebase initialization error:", e);
  }
}

export { auth, db, storage };

// Auth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  access_type: "offline",
});
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");

// Set auth persistence
if (typeof window !== "undefined" && auth) {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

// ==================== TYPES ====================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  businessId?: string;
  onboardingComplete: boolean;
  onboardingStep: number;
  role: "owner" | "admin" | "manager" | "employee";
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: "dark" | "light" | "auto";
    language: string;
    timezone: string;
  };
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  phone: string;
  email?: string;
  address?: string;
  currency: string;
  timezone: string;
  gstin?: string;
  website?: string;
  logo?: string;
  settings: {
    autoReply: boolean;
    businessHours: {
      enabled: boolean;
      timezone: string;
      schedule: Record<string, { open: string; close: string; closed: boolean }>;
    };
    autoInvoice: boolean;
    taxRate: number;
    currencyFormat: string;
  };
  integrations: Record<string, {
    connected: boolean;
    config?: Record<string, any>;
    lastSync?: number;
    status: "connected" | "disconnected" | "error" | "syncing";
  }>;
  departments: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Department {
  id: string;
  businessId: string;
  type: "support" | "sales" | "marketing" | "finance" | "operations" | "hr";
  name: string;
  description: string;
  enabled: boolean;
  agents: Agent[];
  tools: string[];
  config: Record<string, any>;
  stats: {
    tasksToday: number;
    completedToday: number;
    pending: number;
    avgResponseTime: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: "active" | "idle" | "busy" | "offline";
  tasksCompleted: number;
  successRate: number;
  lastActive: number;
}

export interface Conversation {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  channel: "whatsapp" | "email" | "instagram" | "sms" | "web";
  status: "open" | "pending" | "closed" | "assigned";
  assignedTo?: string;
  department: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "customer" | "agent" | "ai" | "system";
  senderName: string;
  content: string;
  type: "text" | "image" | "document" | "audio" | "location" | "contact" | "template";
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface Task {
  id: string;
  businessId: string;
  department: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "waiting_approval" | "completed" | "failed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  createdBy: string;
  dueAt?: number;
  startedAt?: number;
  completedAt?: number;
  metadata: Record<string, any>;
  steps: TaskStep[];
  createdAt: number;
  updatedAt: number;
}

export interface TaskStep {
  id: string;
  taskId: string;
  name: string;
  type: "tool_call" | "handoff" | "approval" | "notification" | "data_fetch" | "data_write";
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
}

export interface InventoryItem {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  supplier?: string;
  barcode?: string;
  images: string[];
  variants: InventoryVariant[];
  status: "active" | "inactive" | "discontinued";
  createdAt: number;
  updatedAt: number;
}

export interface InventoryVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Lead {
  id: string;
  businessId: string;
  source: "whatsapp" | "email" | "phone" | "web" | "referral" | "walkin" | "social";
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value: number;
  currency: string;
  assignedTo?: string;
  tags: string[];
  notes: string;
  nextFollowUpAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  address?: string;
  gstin?: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  currency: string;
  lastOrderAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: number;
  paidAt?: number;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  sku?: string;
}

export interface Notification {
  id: string;
  userId: string;
  businessId: string;
  type: "info" | "success" | "warning" | "error" | "approval" | "task" | "message";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  readAt?: number;
}

export interface WebhookEvent {
  id: string;
  businessId: string;
  source: "razorpay" | "stripe" | "shopify" | "woocommerce" | "zoho" | "hubspot" | "slack" | "whatsapp" | "gmail";
  event: string;
  payload: Record<string, any>;
  processed: boolean;
  processedAt?: number;
  error?: string;
  createdAt: number;
}

export interface AnalyticsData {
  date: string;
  revenueAssisted: number;
  customersHelped: number;
  appointmentsBooked: number;
  ordersClosed: number;
  hoursSaved: number;
  messagesAnswered: number;
  avgResponseTime: number;
  successRate: number;
  automationsCompleted: number;
  departmentStats: Record<string, {
    tasksToday: number;
    completedToday: number;
    successRate: number;
  }>;
  topAgents: Array<{
    name: string;
    department: string;
    tasks: number;
    successRate: number;
  }>;
}

// Helper functions
export function createDefaultUserProfile(uid: string, email: string, displayName: string): UserProfile {
  return {
    uid,
    email,
    displayName,
    onboardingComplete: false,
    onboardingStep: 0,
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
}

export function createDefaultBusinessProfile(ownerId: string, data: OnboardingData): BusinessProfile {
  const businessId = `biz_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id: businessId,
    name: data.businessName,
    type: data.businessType,
    ownerId,
    phone: data.phone,
    address: data.address,
    currency: data.currency,
    timezone: data.timezone,
    settings: {
      autoReply: true,
      businessHours: {
        enabled: true,
        timezone: data.timezone,
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
    departments: data.departments,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export interface OnboardingData {
  businessType: string;
  businessName: string;
  ownerName: string;
  phone: string;
  address?: string;
  currency: string;
  timezone: string;
  integrations: string[];
  departments: string[];
}

// ==================== FIRESTORE SERVICE FUNCTIONS ====================

// User Profile
export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const profile: UserProfile = {
    uid,
    email: data.email || "",
    displayName: data.displayName || "",
    photoURL: data.photoURL,
    phoneNumber: data.phoneNumber,
    businessId: data.businessId,
    onboardingComplete: data.onboardingComplete ?? false,
    onboardingStep: data.onboardingStep ?? 0,
    role: data.role ?? "owner",
    preferences: {
      notifications: { email: true, push: true, sms: false },
      theme: "dark",
      language: "en",
      timezone: "Asia/Kolkata",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastLoginAt: Date.now(),
    ...data,
  };

  await setDoc(doc(db, "users", uid), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function updateUserLastLogin(uid: string): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    lastLoginAt: Date.now(),
    updatedAt: Date.now(),
  });
}

// Business
export async function createBusiness(ownerId: string, data: OnboardingData): Promise<BusinessProfile> {
  const business = createDefaultBusinessProfile(ownerId, data);
  
  await setDoc(doc(db, "businesses", business.id), business);
  
  // Update user profile with business ID
  await updateUserProfile(ownerId, {
    businessId: business.id,
    onboardingComplete: true,
    onboardingStep: 10,
  });

  // Create default departments
  for (const deptType of data.departments) {
    await createDepartment(business.id, deptType);
  }

  return business;
}

export async function getBusiness(businessId: string): Promise<BusinessProfile | null> {
  const docRef = doc(db, "businesses", businessId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as BusinessProfile;
  }
  return null;
}

export async function updateBusiness(businessId: string, data: Partial<BusinessProfile>): Promise<void> {
  const docRef = doc(db, "businesses", businessId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function getBusinessesByOwner(ownerId: string): Promise<BusinessProfile[]> {
  const q = query(
    collection(db, "businesses"),
    where("ownerId", "==", ownerId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BusinessProfile);
}

// Departments
export async function createDepartment(businessId: string, type: string): Promise<string> {
  const deptId = `dept_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const department: Department = {
    id: deptId,
    businessId,
    type: type as Department["type"],
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

  await setDoc(doc(db, "businesses", businessId, "departments", deptId), department);
  return deptId;
}

export async function getDepartments(businessId: string): Promise<Department[]> {
  const q = query(collection(db, "businesses", businessId, "departments"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Department);
}

export async function getDepartment(businessId: string, deptId: string): Promise<Department | null> {
  const docRef = doc(db, "businesses", businessId, "departments", deptId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Department;
  }
  return null;
}

export async function updateDepartment(businessId: string, deptId: string, data: Partial<Department>): Promise<void> {
  const docRef = doc(db, "businesses", businessId, "departments", deptId);
  await updateDoc(docRef, data);
}

// Conversations
export async function getConversations(businessId: string, filters?: {
  department?: string;
  status?: string;
  assignedTo?: string;
  limit?: number;
}): Promise<Conversation[]> {
  let q = query(
    collection(db, "businesses", businessId, "conversations"),
    orderBy("updatedAt", "desc")
  );

  if (filters?.department) {
    q = query(q, where("department", "==", filters.department));
  }
  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters?.assignedTo) {
    q = query(q, where("assignedTo", "==", filters.assignedTo));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Conversation);
}

export async function getConversation(businessId: string, conversationId: string): Promise<Conversation | null> {
  const docRef = doc(db, "businesses", businessId, "conversations", conversationId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Conversation;
  }
  return null;
}

export async function createConversation(businessId: string, data: Partial<Conversation>): Promise<string> {
  const convId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const conversation: Conversation = {
    id: convId,
    businessId,
    customerId: data.customerId || "",
    customerName: data.customerName || "",
    customerPhone: data.customerPhone || "",
    customerEmail: data.customerEmail,
    channel: data.channel || "web",
    status: "open",
    assignedTo: data.assignedTo,
    department: data.department || "support",
    lastMessage: data.lastMessage || "",
    lastMessageAt: Date.now(),
    unreadCount: 0,
    tags: data.tags || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...data,
  };

  await setDoc(doc(db, "businesses", businessId, "conversations", convId), conversation);
  return convId;
}

export async function updateConversation(businessId: string, conversationId: string, data: Partial<Conversation>): Promise<void> {
  const docRef = doc(db, "businesses", businessId, "conversations", conversationId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

// Messages
export async function getMessages(businessId: string, conversationId: string, limitCount = 50): Promise<any[]> {
  const q = query(
    collection(db, "businesses", businessId, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function addMessage(businessId: string, conversationId: string, message: any): Promise<string> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const messageData = {
    id: msgId,
    conversationId,
    senderId: message.senderId || "",
    senderType: message.senderType || "agent",
    senderName: message.senderName || "",
    content: message.content || "",
    type: message.type || "text",
    status: "sent",
    metadata: message.metadata,
    createdAt: Date.now(),
    ...message,
  };

  await setDoc(doc(db, "businesses", businessId, "conversations", conversationId, "messages", msgId), messageData);
  
  // Update conversation last message
  await updateConversation(businessId, conversationId, {
    lastMessage: message.content || "",
    lastMessageAt: Date.now(),
    unreadCount: (message.senderType === "customer" ? 1 : 0),
  });

  return msgId;
}

// Tasks
export async function getTasks(businessId: string, filters?: {
  department?: string;
  status?: string;
  assignedTo?: string;
  limit?: number;
}): Promise<Task[]> {
  let q = query(
    collection(db, "businesses", businessId, "tasks"),
    orderBy("createdAt", "desc")
  );

  if (filters?.department) {
    q = query(q, where("department", "==", filters.department));
  }
  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters?.assignedTo) {
    q = query(q, where("assignedTo", "==", filters.assignedTo));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Task);
}

export async function createTask(businessId: string, data: Partial<Task>): Promise<string> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const task: Task = {
    id: taskId,
    businessId,
    department: data.department || "support",
    title: data.title || "",
    description: data.description || "",
    status: "pending",
    priority: data.priority || "medium",
    assignedTo: data.assignedTo,
    createdBy: data.createdBy || "",
    dueAt: data.dueAt,
    metadata: data.metadata || {},
    steps: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...data,
  };

  await setDoc(doc(db, "businesses", businessId, "tasks", taskId), task);
  return taskId;
}

export async function updateTask(businessId: string, taskId: string, data: Partial<Task>): Promise<void> {
  const docRef = doc(db, "businesses", businessId, "tasks", taskId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function addTaskStep(businessId: string, taskId: string, step: any): Promise<void> {
  const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const taskStep = {
    id: stepId,
    taskId,
    name: step.name,
    type: step.type,
    status: "pending",
    input: step.input,
    output: step.output,
    error: step.error,
    retryCount: 0,
    ...step,
  };

  await setDoc(doc(db, "businesses", businessId, "tasks", taskId, "steps", stepId), taskStep);
  
  // Update task's steps array
  const taskRef = doc(db, "businesses", businessId, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    const task = taskSnap.data() as Task;
    const steps = [...task.steps, taskStep];
    await updateDoc(taskRef, { steps, updatedAt: Date.now() });
  }
}

export async function updateTaskStep(businessId: string, taskId: string, stepId: string, data: Partial<any>): Promise<void> {
  const docRef = doc(db, "businesses", businessId, "tasks", taskId, "steps", stepId);
  await updateDoc(docRef, data);
  
  // If step completed, check if all steps done
  if (data.status === "completed") {
    const taskRef = doc(db, "businesses", businessId, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
      const task = taskSnap.data() as Task;
      const allCompleted = task.steps.every(s => s.status === "completed" || s.id === stepId);
      if (allCompleted) {
        await updateDoc(taskRef, { 
          status: "completed", 
          completedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  }
}

// Inventory
export async function getInventory(businessId: string, filters?: {
  category?: string;
  status?: string;
  lowStock?: boolean;
  limit?: number;
}): Promise<any[]> {
  let q = query(
    collection(db, "businesses", businessId, "inventory"),
    orderBy("name", "asc")
  );

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters?.lowStock) {
    q = query(q, where("stock", "<=", "minStock"));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function getInventoryItem(businessId: string, itemId: string): Promise<any | null> {
  const docRef = doc(db, "businesses", businessId, "inventory", itemId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function createInventoryItem(businessId: string, data: any): Promise<string> {
  const itemId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const item = {
    id: itemId,
    businessId,
    name: data.name || "",
    description: data.description,
    sku: data.sku || `SKU-${Date.now()}`,
    category: data.category || "General",
    unit: data.unit || "pcs",
    costPrice: data.costPrice || 0,
    sellingPrice: data.sellingPrice || 0,
    stock: data.stock || 0,
    minStock: data.minStock || 10,
    maxStock: data.maxStock,
    supplier: data.supplier,
    barcode: data.barcode,
    images: data.images || [],
    variants: data.variants || [],
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...data,
  };

  await setDoc(doc(db, "businesses", businessId, "inventory", itemId), item);
  return itemId;
}

export async function updateInventoryItem(businessId: string, itemId: string, data: any): Promise<void> {
  const docRef = doc(db, "businesses", businessId, "inventory", itemId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function adjustStock(businessId: string, itemId: string, quantity: number, reason: string): Promise<void> {
  const itemRef = doc(db, "businesses", businessId, "inventory", itemId);
  const itemSnap = await getDoc(itemRef);
  
  if (!itemSnap.exists()) throw new Error("Item not found");
  
  const item = itemSnap.data();
  const newStock = Math.max(0, item.stock + quantity);
  
  await updateDoc(itemRef, {
    stock: newStock,
    updatedAt: Date.now(),
  });
  
  // Log stock movement
  await addDoc(collection(db, "businesses", businessId, "stock_movements"), {
    itemId,
    itemName: item.name,
    quantity,
    newStock,
    reason,
    createdAt: Date.now(),
  });
}

// Leads
export async function getLeads(businessId: string, filters?: {
  status?: string;
  assignedTo?: string;
  limit?: number;
}): Promise<any[]> {
  let q = query(
    collection(db, "businesses", businessId, "leads"),
    orderBy("createdAt", "desc")
  );

  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters?.assignedTo) {
    q = query(q, where("assignedTo", "==", filters.assignedTo));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function createLead(businessId: string, data: any): Promise<string> {
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const lead = {
    id: leadId,
    businessId,
    source: data.source || "web",
    name: data.name || "",
    phone: data.phone || "",
    email: data.email,
    company: data.company,
    status: "new",
    value: data.value || 0,
    currency: data.currency || "INR",
    assignedTo: data.assignedTo,
    tags: data.tags || [],
    notes: data.notes || "",
    nextFollowUpAt: data.nextFollowUpAt,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...data,
  };

  await setDoc(doc(db, "businesses", businessId, "leads", leadId), lead);
  return leadId;
}

// Helper functions
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

export { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, Timestamp, writeBatch } from "firebase/firestore";