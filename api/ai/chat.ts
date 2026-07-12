import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { runtime: "nodejs" };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, knowledgeContext, businessName, department } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const knowledgeBlock = knowledgeContext?.length
    ? "\n\nKnowledge base context:\n" + knowledgeContext.map((k: { title: string; content: string }) => `- ${k.title}: ${k.content}`).join("\n")
    : "";

  const systemPrompt = `You are Azolik, an AI workforce coordinator for ${businessName || "a business"}.

You manage 6 AI departments: Support, Sales, Marketing, Finance, Operations, and HR.
Each department has autonomous agents that handle real work.

${knowledgeBlock}

Core rules:
- Be concise and direct (2-3 sentences max unless detail is requested)
- Reference specific departments when relevant
- If a customer message needs handling, describe which departments will coordinate
- Use markdown bold for department names and key actions
- Always be helpful and action-oriented
- If you don't have enough info, say so honestly`;

  try {
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
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI API error:", response.status, errorBody);
      return res.status(502).json({ error: `OpenAI API error: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
