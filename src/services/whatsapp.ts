// WhatsApp Business Cloud API Service
const WHATSAPP_TOKEN = import.meta.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = import.meta.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = "v18.0";
const WHATSAPP_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

export interface WhatsAppMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "text" | "image" | "document" | "template" | "interactive";
  text?: { body: string };
  image?: { link: string; caption?: string };
  document?: { link: string; caption?: string; filename?: string };
  template?: {
    name: string;
    language: { code: string; policy?: string };
    components?: any[];
  };
  interactive?: {
    type: "button" | "list" | "product" | "product_list";
    body: { text: string };
    action: any;
  };
}

export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    throw new Error("WhatsApp credentials not configured");
  }

  const response = await fetch(`${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "WhatsApp send failed");
  }
  return data;
}

export async function sendTextMessage(to: string, body: string) {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  });
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = "en",
  components?: any[]
) {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode, policy: "deterministic" },
      components,
    },
  });
}

export async function sendInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
  footerText?: string
) {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((btn, i) => ({
          type: "reply" as const,
          reply: { id: btn.id, title: btn.title.slice(0, 20) },
        })),
      },
    },
  });
}

export async function sendMediaMessage(
  to: string,
  type: "image" | "document",
  mediaUrl: string,
  caption?: string,
  filename?: string
) {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to,
    type,
    [type]: { link: mediaUrl, caption, filename },
  });
}

// Webhook verification
export function verifyWebhook(signature: string, payload: string, appSecret: string): boolean {
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Message templates for common use cases
export const WHATSAPP_TEMPLATES = {
  order_confirmation: "order_confirmation",
  appointment_reminder: "appointment_reminder",
  payment_received: "payment_received",
  delivery_update: "delivery_update",
  welcome: "welcome_message",
  support_auto_reply: "support_auto_reply",
};

// Webhook event types
export type WhatsAppWebhookEvent = {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: "text" | "image" | "document" | "audio" | "video" | "location" | "contacts" | "button" | "interactive" | "template";
          text?: { body: string };
          image?: { mime_type: string; sha256: string; id: string; caption?: string };
          document?: { mime_type: string; sha256: string; id: string; filename?: string; caption?: string };
          interactive?: {
            type: "button_reply" | "list_reply";
            button_reply?: { id: string; title: string };
            list_reply?: { id: string; title: string; description?: string };
          };
        }>;
        statuses?: Array<{
          id: string;
          status: "sent" | "delivered" | "read" | "failed";
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: "messages";
    }>;
  }>;
};

// Process incoming webhook
export function processWebhook(event: WhatsAppWebhookEvent): Array<{
  type: "message" | "status";
  phoneNumber: string;
  messageId?: string;
  content?: string;
  messageType?: string;
  status?: string;
  timestamp: number;
}> {
  const results: any[] = [];

  for (const entry of event.entry) {
    for (const change of entry.changes) {
      if (change.value.messages) {
        for (const msg of change.value.messages) {
          results.push({
            type: "message",
            phoneNumber: msg.from,
            messageId: msg.id,
            content: msg.text?.body || msg.image?.caption || msg.document?.caption || "",
            messageType: msg.type,
            timestamp: parseInt(msg.timestamp) * 1000,
          });
        }
      }

      if (change.value.statuses) {
        for (const status of change.value.statuses) {
          results.push({
            type: "status",
            phoneNumber: status.recipient_id,
            messageId: status.id,
            status: status.status,
            timestamp: parseInt(status.timestamp) * 1000,
          });
        }
      }
    }
  }

  return results;
}

// Media download
export async function downloadWhatsAppMedia(mediaId: string): Promise<Blob> {
  // First get media URL
  const urlResponse = await fetch(`${WHATSAPP_BASE_URL}/${mediaId}`, {
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}` },
  });
  const urlData = await urlResponse.json();
  
  // Then download the media
  const mediaResponse = await fetch(urlData.url, {
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}` },
  });
  return mediaResponse.blob();
}