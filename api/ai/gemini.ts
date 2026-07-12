import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { runtime: "nodejs" };

interface BusinessKnowledge {
  businessName: string;
  businessType: string;
  businessDescription: string;
  products: Array<{ name: string; price: number; stock: number; unit?: string }>;
  services: Array<{ name: string; price: number }>;
  pricing: Record<string, number>;
  openingHours: string;
  policies: string[];
  previousConversation: Array<{ role: "user" | "assistant"; content: string }>;
  customerMessage: string;
}

function buildSystemPrompt(knowledge: BusinessKnowledge): string {
  const { businessName, businessType, businessDescription, products, services, pricing, openingHours, policies } = knowledge;

  const productsText = products.length > 0
    ? products.map(p => `${p.name} - ${p.price}${p.unit ? `/${p.unit}` : ""} (${p.stock} in stock)`).join("\n")
    : "No products configured";

  const servicesText = services.length > 0
    ? services.map(s => `${s.name} - ${s.price}`).join("\n")
    : "No services configured";

  const policiesText = policies.length > 0
    ? policies.map(p => `- ${p}`).join("\n")
    : "No policies configured";

  return `You are an employee of ${businessName}, a ${businessType}.

Business Description: ${businessDescription}

PRODUCTS:
${productsText}

SERVICES:
${servicesText}

OPENING HOURS: ${openingHours}

POLICIES:
${policiesText}

CORE RULES - NEVER VIOLATE THESE:
1. You are a REAL EMPLOYEE of ${businessName}. Never mention you are an AI, LLM, or language model.
2. Answer ONLY as a business employee replying on WhatsApp. Warm, concise, helpful.
3. NEVER invent inventory, prices, appointments, or availability. Only use the data above.
4. If you don't know something from the business knowledge, say so honestly: "I don't have that information right now, let me check with the team."
5. Use Indian Rupees (₹) for all prices.
6. Keep responses under 3 short paragraphs. WhatsApp style.
7. If the customer wants to buy/book, give them the next step (payment link, booking, etc.) but don't invent links.
8. Reference specific products/services/prices from the knowledge above when relevant.
9. Match the customer's language (Hindi/English/Hinglish).
10. Sound human - use contractions, brief sentences, friendly tone.

EXAMPLES:

Customer: "Do you have chocolate cake?"
Employee: "Yes! We have Chocolate Cake (500g) for ₹549 and 1kg for ₹999. Both in stock. Want me to reserve one?"

Customer: "Can I book a haircut for tomorrow?"
Employee: "Absolutely. Tomorrow we have slots at 11:00 AM, 1:30 PM, and 5:00 PM. Which works for you?"

Customer: "What are your hours?"
Employee: "We're open ${openingHours}. Closed Mondays."

Customer: "How much for the Wireless Earbuds?"
Employee: "Wireless Earbuds Pro are ₹2,499. We have 142 in stock. Want me to send a payment link?"

Customer: "Do you repair iPhones?"
Employee: "I don't see phone repairs in our services. We do ${servicesText.split("\n")[0] || "various services"}. Want me to check with the team?"

Customer: "Can I order 3 pizzas?"
Employee: "I don't see pizzas on our menu. We have ${productsText.split("\n")[0] || "various items"}. Let me know if something else works!"

---
Now respond to the customer's latest message.`;
}

function buildUserPrompt(knowledge: BusinessKnowledge): string {
  const { previousConversation, customerMessage } = knowledge;

  let conversationText = "";
  if (previousConversation.length > 0) {
    conversationText = "PREVIOUS CONVERSATION:\n" +
      previousConversation.map(m => `${m.role === "user" ? "Customer" : "You"}: ${m.content}`).join("\n") +
      "\n\n";
  }

  return `${conversationText}Customer: ${customerMessage}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { knowledge }: { knowledge: BusinessKnowledge } = req.body;

  if (!knowledge?.customerMessage) {
    return res.status(400).json({ error: "Customer message is required" });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured");
    return res.status(500).json({ error: "AI service not configured" });
  }

  const systemPrompt = buildSystemPrompt(knowledge);
  const userPrompt = buildUserPrompt(knowledge);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I'm ready to help customers as an employee of this business." }] },
            { role: "user", parts: [{ text: userPrompt }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API error:", response.status, errorBody);
      return res.status(502).json({ error: `AI service error: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response. Please try again.";

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}