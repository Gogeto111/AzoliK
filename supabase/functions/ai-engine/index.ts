// Supabase Edge Function: AI Engine
// Deploy with: supabase functions deploy ai-engine

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const { executionId } = await req.json();

    // Get execution details
    const { data: execution, error: execError } = await supabase
      .from("ai_workflow_executions")
      .select("*")
      .eq("id", executionId)
      .single();

    if (execError || !execution) {
      throw new Error("Execution not found");
    }

    // Update status to running
    await supabase
      .from("ai_workflow_executions")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", executionId);

    const { business_id, department, trigger_data } = execution;
    const steps = execution.steps || [];

    // Execute each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update step status
      await supabase
        .from("ai_workflow_executions")
        .update({
          steps: steps.map((s, idx) => idx === i ? { ...s, status: "running", started_at: new Date().toISOString() } : s),
        })
        .eq("id", executionId);

      try {
        const result = await executeStep(step, trigger_data, business_id, department, openai, supabase);
        
        // Update step with result
        steps[i] = { ...step, status: "completed", output: result, completed_at: new Date().toISOString() };
        
        await supabase
          .from("ai_workflow_executions")
          .update({ steps })
          .eq("id", executionId);

      } catch (stepError) {
        steps[i] = { ...step, status: "failed", error: stepError.message };
        await supabase
          .from("ai_workflow_executions")
          .update({ steps, status: "failed", error: stepError.message })
          .eq("id", executionId);
        throw stepError;
      }
    }

    // Mark execution as completed
    await supabase
      .from("ai_workflow_executions")
      .update({ status: "completed", completed_at: new Date().toISOString(), steps })
      .eq("id", executionId);

    return new Response(JSON.stringify({ success: true, steps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Engine error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function executeStep(step: any, triggerData: any, businessId: string, department: string, openai: any, supabase: any) {
  switch (step.type) {
    case "read_knowledge":
      return await readKnowledge(step, businessId, supabase);
    
    case "generate_reply":
      return await generateReply(step, triggerData, openai);
    
    case "update_crm":
      return await updateCRM(step, triggerData, businessId, supabase);
    
    case "book_appointment":
      return await bookAppointment(step, triggerData, businessId, supabase);
    
    case "create_invoice":
      return await createInvoice(step, triggerData, businessId, supabase);
    
    case "send_message":
      return await sendMessage(step, triggerData, businessId, supabase);
    
    default:
      return { message: `Unknown step type: ${step.type}` };
  }
}

async function readKnowledge(step: any, businessId: string, supabase: any) {
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("title, content, metadata")
    .eq("business_id", businessId)
    .eq("category", step.input?.category || "faqs")
    .limit(step.input?.limit || 10);

  if (error) throw error;
  return { knowledge: data };
}

async function generateReply(step: any, triggerData: any, openai: any) {
  const customerMessage = triggerData?.message || "";
  const context = step.input?.context || "";
  const knowledge = step.input?.knowledge || [];

  const prompt = `You are an AI assistant for ${department} department.
Context: ${context}
Knowledge: ${JSON.stringify(knowledge)}
Customer message: ${customerMessage}

Generate a helpful, professional reply. Keep it concise and actionable.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: customerMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return { reply: completion.choices[0].message.content };
}

async function updateCRM(step: any, triggerData: any, businessId: string, supabase: any) {
  const { action, data } = step.input;
  
  switch (action) {
    case "create_lead":
      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          business_id: businessId,
          ...data,
          source: "ai_automation",
          status: "new",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return { lead };
    
    case "update_lead":
      const { data: updatedLead } = await supabase
        .from("leads")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", data.id)
        .select()
        .single();
      
      return { lead: updatedLead };
    
    case "create_customer":
      const { data: customer } = await supabase
        .from("customers")
        .insert({
          business_id: businessId,
          ...data,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      return { customer };
    
    default:
      return { message: `Unknown CRM action: ${action}` };
  }
}

async function bookAppointment(step: any, triggerData: any, businessId: string, supabase: any) {
  const { customerId, requestedTime, reason, duration = 60 } = step.input;
  
  // Create task for appointment
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      business_id: businessId,
      department: "support",
      title: "Appointment Booking",
      description: `Book appointment for customer: ${reason}`,
      status: "pending",
      priority: "high",
      metadata: { type: "appointment", customerId, requestedTime, duration },
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  // Try to create calendar event if Google Calendar is connected
  // This would call the Google Calendar API
  
  return { task, appointmentBooked: true };
}

async function createInvoice(step: any, triggerData: any, businessId: string, supabase: any) {
  const { customerId, items, dueDate } = step.input;
  
  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;
  
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      items,
      subtotal,
      tax,
      total,
      currency: "INR",
      status: "draft",
      due_date: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  return { invoice };
}

async function sendMessage(step: any, triggerData: any, businessId: string, supabase: any) {
  const { channel, to, content, template } = step.input;
  
  // This would integrate with WhatsApp, Email, etc.
  // For now, just log
  console.log(`Sending ${channel} message to ${to}:`, content);
  
  return { sent: true, channel, to };
}