import { sb, AIWorkflowExecution, WorkflowStep, KnowledgeBaseItem, Conversation, Task } from "@/lib/supabase";
import { getSupabase } from "@/lib/supabase";

// AI Engine - Core workflow execution
export class AIEngine {
  private businessId: string;
  private department: string;

  constructor(businessId: string, department: string) {
    this.businessId = businessId;
    this.department = department;
  }

  // Main entry point: Process incoming message
  async processIncomingMessage(conversationId: string, messageId: string, content: string, senderId: string) {
    const execution = await this.createExecution("message", {
      conversationId,
      messageId,
      content,
      senderId,
    });

    try {
      // Step 1: Read knowledge base
      await this.executeStep(execution.id, "read_knowledge", "Read Knowledge Base", async () => {
        const knowledge = await this.searchKnowledge(content);
        return { knowledge, query: content };
      });

      // Step 2: Generate AI reply
      const replyResult = await this.executeStep(execution.id, "generate_reply", "Generate AI Reply", async () => {
        const knowledge = execution.steps.find((s: WorkflowStep) => s.name === "Read Knowledge Base")?.output?.knowledge || [];
        const reply = await this.generateReply(content, knowledge);
        return { reply };
      });

      // Step 3: Send reply
      await this.executeStep(execution.id, "send_message", "Send Reply", async () => {
        const reply = replyResult.output?.reply;
        if (reply) {
          await this.sendMessage(conversationId, reply);
        }
        return { sent: true };
      });

      // Step 4: Update CRM / Conversation
      await this.executeStep(execution.id, "update_crm", "Update CRM", async () => {
        await this.updateConversation(conversationId, content);
        return { updated: true };
      });

      // Step 5: Check for actions needed (booking, invoice, etc.)
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

      // Mark execution as completed
      await this.completeExecution(execution.id);
      return execution;

    } catch (error) {
      await this.failExecution(execution.id, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  // Create workflow execution record
  private async createExecution(triggerType: AIWorkflowExecution["trigger_type"], triggerData: any) {
    const { data, error } = await sb
      .from("ai_workflow_executions")
      .insert({
        business_id: this.businessId,
        department: this.department,
        trigger_type: triggerType,
        trigger_data: triggerData,
        status: "running",
        steps: [],
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Execute a single step
  private async executeStep(
    executionId: string, 
    stepType: WorkflowStep["type"], 
    stepName: string, 
    fn: () => Promise<any>
  ): Promise<WorkflowStep> {
    // Create step record
    const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const step: WorkflowStep = {
      id: stepId,
      execution_id: executionId,
      name: stepName,
      type: stepType,
      status: "running",
      started_at: new Date().toISOString(),
    };

    // Update execution with new step
    const { data: exec } = await sb
      .from("ai_workflow_executions")
      .select("steps")
      .eq("id", executionId)
      .single();
    
    const existingSteps = exec?.steps || [];
    await sb
      .from("ai_workflow_executions")
      .update({ 
        steps: [...existingSteps, step],
      })
      .eq("id", executionId);

    try {
      const output = await fn();
      
      // Update step as completed
      const completedStep = {
        ...step,
        status: "completed" as const,
        output,
        completed_at: new Date().toISOString(),
      };

      const { data: execData } = await sb
        .from("ai_workflow_executions")
        .select("steps")
        .eq("id", executionId)
        .single();
      const updatedSteps = (execData?.steps || []).map((s: WorkflowStep) => s.id === stepId ? completedStep : s);
      await sb
        .from("ai_workflow_executions")
        .update({ steps: updatedSteps })
        .eq("id", executionId);

      return completedStep;
    } catch (error) {
      // Update step as failed
      const failedStep = {
        ...step,
        status: "failed" as const,
        error: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date().toISOString(),
      };

      const { data: failData } = await sb
        .from("ai_workflow_executions")
        .select("steps")
        .eq("id", executionId)
        .single();
      const failSteps = (failData?.steps || []).map((s: WorkflowStep) => s.id === stepId ? failedStep : s);
      await sb
        .from("ai_workflow_executions")
        .update({ steps: failSteps })
        .eq("id", executionId);

      throw error;
    }
  }

  // Search knowledge base for relevant info
  private async searchKnowledge(query: string): Promise<KnowledgeBaseItem[]> {
    // In production, use vector similarity search with embeddings
    // For now, use text search
    const { data, error } = await sb
      .from("knowledge_base")
      .select("*")
      .eq("business_id", this.businessId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  // Generate AI reply using OpenAI API
  private async generateReply(userMessage: string, knowledge: KnowledgeBaseItem[]): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_OPENAI_API_KEY is not configured");
    }

    const knowledgeContext = knowledge.length > 0
      ? "\n\nKnowledge base context:\n" + knowledge.map(k => `- ${k.title}: ${k.content}`).join("\n")
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

  // Send message to conversation
  private async sendMessage(conversationId: string, content: string) {
    const { error } = await sb
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: "ai_engine",
        sender_type: "ai",
        sender_name: "Azolik AI",
        content,
        type: "text",
        status: "sent",
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Update conversation last message
    await sb
      .from("conversations")
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
  }

  // Update conversation in CRM
  private async updateConversation(conversationId: string, customerMessage: string) {
    // Update conversation status, tags, etc.
    await sb
      .from("conversations")
      .update({
        status: "open",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
  }

  // Detect actions needed from message
  private async detectActions(customerMessage: string, aiReply: string) {
    const actions: {
      bookAppointment?: any;
      createInvoice?: any;
      updateLead?: any;
      createTask?: any;
    } = {};

    const lowerMessage = customerMessage.toLowerCase();

    // Detect appointment booking intent
    if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
      if (aiReply.includes("date") || aiReply.includes("time")) {
        // Extract date/time from conversation (simplified)
        actions.bookAppointment = {
          customerId: "", // Would extract from conversation
          requestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reason: "Customer requested appointment",
        };
      }
    }

    // Detect invoice creation intent
    if (lowerMessage.includes("invoice") || lowerMessage.includes("bill me") || lowerMessage.includes("send invoice")) {
      actions.createInvoice = {
        customerId: "",
        items: [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    // Detect lead update
    if (this.department === "sales" && (lowerMessage.includes("interested") || lowerMessage.includes("quote"))) {
      actions.updateLead = {
        status: "qualified",
        notes: "Customer expressed interest via chat",
      };
    }

    // Detect task creation
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

  // Book appointment
  private async bookAppointment(data: any) {
    // Create calendar event via Google Calendar integration
    // Create task for team
    const { data: task, error } = await sb
      .from("tasks")
      .insert({
        business_id: this.businessId,
        department: this.department,
        title: "Appointment Booking",
        description: `Book appointment for customer: ${data.reason}`,
        status: "pending",
        priority: "high",
        metadata: { type: "appointment", ...data },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return task;
  }

  // Create invoice
  private async createInvoice(data: any) {
    const { data: invoice, error } = await sb
      .from("invoices")
      .insert({
        business_id: this.businessId,
        customer_id: data.customerId,
        customer_name: "",
        customer_phone: "",
        items: data.items,
        subtotal: 0,
        tax: 0,
        total: 0,
        currency: "INR",
        status: "draft",
        due_date: data.dueDate,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return invoice;
  }

  // Update lead in Supabase
  private async updateLead(data: any) {
    const { data: lead, error } = await sb
      .from("leads")
      .update({
        status: data.status || "qualified",
        notes: data.notes || "",
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", this.businessId)
      .select()
      .single();

    if (error) throw error;
    return lead;
  }

  // Create task
  private async createTask(data: any) {
    const { data: task, error } = await sb
      .from("tasks")
      .insert({
        business_id: this.businessId,
        department: this.department,
        title: data.title,
        description: data.description,
        status: "pending",
        priority: data.priority || "medium",
        due_at: data.dueAt,
        metadata: { type: "follow_up" },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return task;
  }

  // Complete execution
  private async completeExecution(executionId: string) {
    await sb
      .from("ai_workflow_executions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", executionId);
  }

  // Fail execution
  private async failExecution(executionId: string, error: string) {
    await sb
      .from("ai_workflow_executions")
      .update({
        status: "failed",
        error,
        completed_at: new Date().toISOString(),
      })
      .eq("id", executionId);
  }

  // Get execution history
  async getExecutionHistory(limit = 50) {
    const { data, error } = await sb
      .from("ai_workflow_executions")
      .select("*")
      .eq("business_id", this.businessId)
      .eq("department", this.department)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

// Factory function
export function createAIEngine(businessId: string, department: string) {
  return new AIEngine(businessId, department);
}

// Department-specific engines
export const SupportEngine = (businessId: string) => createAIEngine(businessId, "support");
export const SalesEngine = (businessId: string) => createAIEngine(businessId, "sales");
export const FinanceEngine = (businessId: string) => createAIEngine(businessId, "finance");
export const OperationsEngine = (businessId: string) => createAIEngine(businessId, "operations");
export const MarketingEngine = (businessId: string) => createAIEngine(businessId, "marketing");
export const HREngine = (businessId: string) => createAIEngine(businessId, "hr");