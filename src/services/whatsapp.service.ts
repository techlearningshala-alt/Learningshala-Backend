import { AppError } from "../middlewares/error.middleware";
import {
  CreateWhatsAppUniversityDto,
  UpdateWhatsAppUniversityDto,
} from "../models/whatsapp.model";
import {
  WhatsAppConversationRepository,
  WhatsAppMessageRepository,
  WhatsAppUniversityRepository,
} from "../repositories/whatsapp.repository";
import {
  getWebhookVerifyToken,
  sendWhatsAppTextMessage,
} from "./whatsapp_meta.client";

export const listWhatsAppUniversities = () => WhatsAppUniversityRepository.findAll();

export const createWhatsAppUniversity = (payload: CreateWhatsAppUniversityDto) =>
  WhatsAppUniversityRepository.create(payload);

export const updateWhatsAppUniversity = (
  id: number,
  payload: UpdateWhatsAppUniversityDto
) => WhatsAppUniversityRepository.update(id, payload);

export const listWhatsAppConversations = (params: {
  universityId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) => WhatsAppConversationRepository.list(params);

export const getWhatsAppConversationThread = async (conversationId: number) => {
  const conversation = await WhatsAppConversationRepository.findById(conversationId);
  if (!conversation) throw new AppError("Conversation not found", 404);
  const messages = await WhatsAppMessageRepository.listByConversation(conversationId);
  return { conversation, messages };
};

/**
 * Admin reply: resolve conversation → university phone_number_id → Meta send → store outbound.
 */
export const sendWhatsAppReply = async (conversationId: number, body: string) => {
  const text = String(body || "").trim();
  if (!text) throw new AppError("Message body is required", 400);

  const conversation = await WhatsAppConversationRepository.findById(conversationId);
  if (!conversation) throw new AppError("Conversation not found", 404);

  const university = await WhatsAppUniversityRepository.findById(
    conversation.university_id
  );
  if (!university?.phone_number_id) {
    throw new AppError(
      "This university has no phone_number_id configured. Add it under WhatsApp → Accounts after Embedded Signup.",
      400
    );
  }

  // Meta API call — sends as THIS university's WhatsApp number (phone_number_id)
  const meta = await sendWhatsAppTextMessage({
    phoneNumberId: university.phone_number_id,
    toStudentPhone: conversation.student_phone_number,
    body: text,
  });

  const message = await WhatsAppMessageRepository.create({
    conversationId,
    direction: "outbound",
    body: text,
    waMessageId: meta.messageId,
    timestamp: new Date(),
  });

  return { message, meta_message_id: meta.messageId };
};

export const updateConversationStatus = async (
  id: number,
  status: "open" | "closed"
) => {
  const ok = await WhatsAppConversationRepository.updateStatus(id, status);
  if (!ok) throw new AppError("Conversation not found", 404);
  return WhatsAppConversationRepository.findById(id);
};

/** Meta webhook verification challenge (GET) */
export const verifyWhatsAppWebhookChallenge = (query: {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}): string | null => {
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];
  const expected = getWebhookVerifyToken();

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return challenge;
  }
  return null;
};

function unixToDate(ts: string | number | undefined): Date {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return new Date();
  // Meta sends seconds
  return new Date(n * 1000);
}

/**
 * Process Meta webhook payload for ALL university numbers.
 * phone_number_id in metadata identifies which whatsapp_universities row to use.
 */
export const processWhatsAppWebhookPayload = async (payload: any) => {
  if (!payload || payload.object !== "whatsapp_business_account") {
    return { processed: 0 };
  }

  let processed = 0;
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      if (change?.field && change.field !== "messages") continue;
      const value = change?.value;
      if (!value) continue;

      const phoneNumberId = String(value?.metadata?.phone_number_id || "").trim();
      if (!phoneNumberId) continue;

      // Map Meta phone_number_id → our whatsapp_universities row
      const university =
        await WhatsAppUniversityRepository.findByPhoneNumberId(phoneNumberId);
      if (!university) {
        console.warn(
          `WhatsApp webhook: unknown phone_number_id=${phoneNumberId}. Add university under WhatsApp → Accounts.`
        );
        continue;
      }

      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const msg of messages) {
        const from = String(msg?.from || "").replace(/\D/g, "");
        const waMessageId = msg?.id ? String(msg.id) : null;
        const type = String(msg?.type || "");

        let body = "";
        if (type === "text") {
          body = String(msg?.text?.body || "").trim();
        } else if (type === "button") {
          body = String(msg?.button?.text || msg?.button?.payload || "[button]").trim();
        } else if (type === "interactive") {
          body = String(
            msg?.interactive?.button_reply?.title ||
              msg?.interactive?.list_reply?.title ||
              "[interactive]"
          ).trim();
        } else {
          // Media / unsupported — store a placeholder so thread still shows activity
          body = `[${type || "unsupported"} message]`;
        }

        if (!from || !body) continue;

        const conversation = await WhatsAppConversationRepository.findOrCreate(
          university.id,
          from
        );

        await WhatsAppMessageRepository.create({
          conversationId: conversation.id,
          direction: "inbound",
          body,
          waMessageId,
          timestamp: unixToDate(msg?.timestamp),
        });
        processed += 1;
      }
    }
  }

  return { processed };
};
