import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  addDoc,
  serverTimestamp,
} from "@/lib/firebase";

interface WorkflowStep {
  id: string;
  executionId: string;
  name: string;
  type: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  output?: any;
  error?: string;
}

interface AIWorkflowExecution {
  id: string;
  businessId: string;
  department: string;
  triggerType: string;
  triggerData: any;
  status: string;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface KnowledgeBaseItem {
  id: string;
  businessId: string;
  category: string;
  title: string;
  content: string;
  metadata: any;
}

export class AIEngine {
  private businessId: string;
  private department: string;

  constructor(businessId: string, department: string) {
    this.businessId = businessId;
    this.department = department;
  }

  async processIncomingMessage(conversationId: string, messageId: string, content: string, senderId: string) {
    const execution = await this.createExecution("message", {
      conversationId,
      messageId,
      content,
      senderId,
    });

    try {
      await this.executeStep(execution.id, "read_knowledge", "Read Knowledge Base", async () => {
        const knowledge = await this.searchKnowledge(content);
        return { knowledge, query: content };
      });

      const replyResult = await this.executeStep(execution.id, "generate_reply", "Generate AI Reply", async () => {
        const executionSnap = await getDoc(doc(db, "ai_workflow_executions", execution.id));
        const execData = executionSnap.data() as AIWorkflowExecution;
        const knowledge = execData?.steps?.find((s) => s.name === "Read Knowledge Base")?.output?.knowledge || [];
        const reply = await this.generateReply(content, knowledge);
        return { reply };
      });

      await this.executeStep(execution.id, "send_message", "Send Reply", async () => {
        const reply = replyResult.output?.reply;
        if (reply) {
          await this.sendMessage(conversationId, reply);
        }
        return { sent: true };
      });

      await this.executeStep(execution.id, "update_crm", "Update CRM", async () => {
        await this.updateConversation(conversationId, content);
        return { updated: true };
      });

      const actions = await this.detectActions(content, replyResult.output?.reply);

      if (actions.bookAppointment) {
        await this.executeStep(execution.id, "book_appointment", "Book Appointment", async () => {
          const appointment = await this.bookAppointment(actions.bookAppointment);
          return { appointment };
        });
      }

      if (actions.createInvoice) {
        await this.executeStep(execution.id, "create_invoice", "Create Invoice", async () => {
          const invoice = await this.createInvoice(actions.createInvoice);
          return { invoice };
        });
      }

      if (actions.updateLead) {
        await this.executeStep(execution.id, "update_crm", "Update Lead", async () => {
          await this.updateLead(actions.updateLead);
          return { updated: true };
        });
      }

      if (actions.createTask) {
        await this.executeStep(execution.id, "create_task", "Create Task", async () => {
          const task = await this.createTask(actions.createTask);
          return { task };
        });
      }

      await this.completeExecution(execution.id);

      const finalSnap = await getDoc(doc(db, "ai_workflow_executions", execution.id));
      return { id: finalSnap.id, ...finalSnap.data() } as AIWorkflowExecution;

    } catch (error) {
      await this.failExecution(execution.id, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  private async createExecution(triggerType: string, triggerData: any): Promise<AIWorkflowExecution> {
    const executionData = {
      businessId: this.businessId,
      department: this.department,
      triggerType: triggerType,
      triggerData: triggerData,
      status: "running",
      steps: [],
      startedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "ai_workflow_executions"), executionData);
    return { id: docRef.id, ...executionData } as AIWorkflowExecution;
  }

  private async executeStep(
    executionId: string,
    stepType: string,
    stepName: string,
    fn: () => Promise<any>
  ): Promise<WorkflowStep> {
    const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const step: WorkflowStep = {
      id: stepId,
      executionId: executionId,
      name: stepName,
      type: stepType,
      status: "running",
      startedAt: new Date().toISOString(),
    };

    const execSnap = await getDoc(doc(db, "ai_workflow_executions", executionId));
    const existingSteps = (execSnap.data()?.steps as WorkflowStep[]) || [];
    await updateDoc(doc(db, "ai_workflow_executions", executionId), {
      steps: [...existingSteps, step],
    });

    try {
      const output = await fn();

      const completedStep: WorkflowStep = {
        ...step,
        status: "completed",
        output,
        completedAt: new Date().toISOString(),
      };

      const updatedSnap = await getDoc(doc(db, "ai_workflow_executions", executionId));
      const updatedSteps = ((updatedSnap.data()?.steps as WorkflowStep[]) || []).map((s) =>
        s.id === stepId ? completedStep : s
      );
      await updateDoc(doc(db, "ai_workflow_executions", executionId), { steps: updatedSteps });

      return completedStep;
    } catch (error) {
      const failedStep: WorkflowStep = {
        ...step,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date().toISOString(),
      };

      const failSnap = await getDoc(doc(db, "ai_workflow_executions", executionId));
      const failSteps = ((failSnap.data()?.steps as WorkflowStep[]) || []).map((s) =>
        s.id === stepId ? failedStep : s
      );
      await updateDoc(doc(db, "ai_workflow_executions", executionId), { steps: failSteps });

      throw error;
    }
  }

  private async searchKnowledge(searchQuery: string): Promise<KnowledgeBaseItem[]> {
    const knowledgeRef = collection(db, "businesses", this.businessId, "knowledge");
    const q = query(knowledgeRef, firestoreLimit(50));
    const snapshot = await getDocs(q);

    const lowerQuery = searchQuery.toLowerCase();
    const results: KnowledgeBaseItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const item: KnowledgeBaseItem = {
        id: docSnap.id,
        businessId: data.businessId || this.businessId,
        category: data.category || "",
        title: data.title || "",
        content: data.content || "",
        metadata: data.metadata || {},
      };

      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery)
      ) {
        results.push(item);
      }
    });

    return results.slice(0, 10);
  }

  private async generateReply(userMessage: string, knowledge: KnowledgeBaseItem[]): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_OPENAI_API_KEY is not configured");
    }

    const knowledgeContext = knowledge.length > 0
      ? "\n\nKnowledge base context:\n" + knowledge.map((k) => `- ${k.title}: ${k.content}`).join("\n")
      : "";

    const systemPrompt = `You are an AI assistant for a business department: ${this.department}.${knowledgeContext}

Respond helpfully, concisely, and professionally. Use the knowledge base context when relevant to answer the customer's question accurately. If you don't have enough information, say so honestly rather than making things up. Keep replies under 500 words.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  }

  private async sendMessage(conversationId: string, content: string) {
    const messagesRef = collection(db, "businesses", this.businessId, "conversations", conversationId, "messages");
    await addDoc(messagesRef, {
      conversationId: conversationId,
      senderId: "ai_engine",
      senderType: "ai",
      senderName: "Azolik AI",
      content,
      type: "text",
      status: "sent",
      createdAt: Date.now(),
    });

    await updateDoc(doc(db, "businesses", this.businessId, "conversations", conversationId), {
      lastMessage: content,
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  private async updateConversation(conversationId: string, _customerMessage: string) {
    await updateDoc(doc(db, "businesses", this.businessId, "conversations", conversationId), {
      status: "open",
      updatedAt: Date.now(),
    });
  }

  private async detectActions(customerMessage: string, aiReply: string) {
    const actions: {
      bookAppointment?: any;
      createInvoice?: any;
      updateLead?: any;
      createTask?: any;
    } = {};

    const lowerMessage = customerMessage.toLowerCase();

    if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
      if (aiReply.includes("date") || aiReply.includes("time")) {
        actions.bookAppointment = {
          customerId: "",
          requestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reason: "Customer requested appointment",
        };
      }
    }

    if (lowerMessage.includes("invoice") || lowerMessage.includes("bill me") || lowerMessage.includes("send invoice")) {
      actions.createInvoice = {
        customerId: "",
        items: [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (this.department === "sales" && (lowerMessage.includes("interested") || lowerMessage.includes("quote"))) {
      actions.updateLead = {
        status: "qualified",
        notes: "Customer expressed interest via chat",
      };
    }

    if (lowerMessage.includes("follow up") || lowerMessage.includes("call me") || lowerMessage.includes("email me")) {
      actions.createTask = {
        title: "Follow up with customer",
        description: `Customer requested follow up: ${customerMessage}`,
        priority: "high",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return actions;
  }

  private async bookAppointment(data: any) {
    const tasksRef = collection(db, "businesses", this.businessId, "tasks");
    const docRef = await addDoc(tasksRef, {
      businessId: this.businessId,
      department: this.department,
      title: "Appointment Booking",
      description: `Book appointment for customer: ${data.reason}`,
      status: "pending",
      priority: "high",
      metadata: { type: "appointment", ...data },
      createdAt: Date.now(),
    });

    return { id: docRef.id };
  }

  private async createInvoice(data: any) {
    const invoicesRef = collection(db, "businesses", this.businessId, "invoices");
    const docRef = await addDoc(invoicesRef, {
      businessId: this.businessId,
      customerId: data.customerId,
      customerName: "",
      customerPhone: "",
      items: data.items,
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: "INR",
      status: "draft",
      dueDate: data.dueDate,
      createdAt: Date.now(),
    });

    return { id: docRef.id };
  }

  private async updateLead(data: any) {
    const leadsRef = collection(db, "businesses", this.businessId, "leads");
    const q = query(leadsRef, where("businessId", "==", this.businessId), firestoreLimit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const leadDoc = snapshot.docs[0];
      await updateDoc(doc(db, "businesses", this.businessId, "leads", leadDoc.id), {
        status: data.status || "qualified",
        notes: data.notes || "",
        updatedAt: Date.now(),
      });
    }
  }

  private async createTask(data: any) {
    const tasksRef = collection(db, "businesses", this.businessId, "tasks");
    const docRef = await addDoc(tasksRef, {
      businessId: this.businessId,
      department: this.department,
      title: data.title,
      description: data.description,
      status: "pending",
      priority: data.priority || "medium",
      dueAt: data.dueAt,
      metadata: { type: "follow_up" },
      createdAt: Date.now(),
    });

    return { id: docRef.id };
  }

  private async completeExecution(executionId: string) {
    await updateDoc(doc(db, "ai_workflow_executions", executionId), {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  private async failExecution(executionId: string, error: string) {
    await updateDoc(doc(db, "ai_workflow_executions", executionId), {
      status: "failed",
      error,
      completedAt: new Date().toISOString(),
    });
  }

  async getExecutionHistory(maxLimit = 50) {
    const execRef = collection(db, "ai_workflow_executions");
    const q = query(
      execRef,
      where("businessId", "==", this.businessId),
      where("department", "==", this.department),
      orderBy("startedAt", "desc"),
      firestoreLimit(maxLimit)
    );

    const snapshot = await getDocs(q);
    const results: AIWorkflowExecution[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as AIWorkflowExecution);
    });
    return results;
  }
}

export function createAIEngine(businessId: string, department: string) {
  return new AIEngine(businessId, department);
}

export const SupportEngine = (businessId: string) => createAIEngine(businessId, "support");
export const SalesEngine = (businessId: string) => createAIEngine(businessId, "sales");
export const FinanceEngine = (businessId: string) => createAIEngine(businessId, "finance");
export const OperationsEngine = (businessId: string) => createAIEngine(businessId, "operations");
export const MarketingEngine = (businessId: string) => createAIEngine(businessId, "marketing");
export const HREngine = (businessId: string) => createAIEngine(businessId, "hr");
