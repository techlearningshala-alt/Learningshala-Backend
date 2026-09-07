import crypto from "crypto";
import { AppError } from "../middlewares/error.middleware";

/**
 * Meta WhatsApp Cloud API helpers.
 *
 * Env (shared for ALL universities — one System User token under one BM):
 *   WHATSAPP_ACCESS_TOKEN  — permanent System User token
 *   META_APP_SECRET        — App Secret (X-Hub-Signature-256 verification)
 *   WEBHOOK_VERIFY_TOKEN   — arbitrary string you set in Meta webhook config
 *
 * Per-university phone_number_id / waba_id live in DB table `whatsapp_universities`
 * (Admin → WhatsApp → Accounts after Embedded Signup).
 */

const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v21.0";

export function getWhatsAppAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new AppError("WHATSAPP_ACCESS_TOKEN is not configured", 500);
  }
  return token;
}

export function getWebhookVerifyToken(): string {
  return process.env.WEBHOOK_VERIFY_TOKEN?.trim() || "";
}

export function getMetaAppSecret(): string {
  return process.env.META_APP_SECRET?.trim() || "";
}

/** Verify Meta webhook signature header X-Hub-Signature-256 */
export function verifyWhatsAppSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined
): boolean {
  const appSecret = getMetaAppSecret();
  if (!appSecret) {
    console.error("META_APP_SECRET is not configured — rejecting webhook");
    return false;
  }
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type MetaSendTextResult = {
  messageId: string | null;
  raw: any;
};

/**
 * Meta Cloud API: send a text message AS a specific university number.
 * POST https://graph.facebook.com/{version}/{phone_number_id}/messages
 *
 * `phoneNumberId` comes from `whatsapp_universities.phone_number_id`
 * (set after Embedded Signup for that university).
 */
export async function sendWhatsAppTextMessage(params: {
  phoneNumberId: string;
  toStudentPhone: string;
  body: string;
}): Promise<MetaSendTextResult> {
  const token = getWhatsAppAccessToken();
  const phoneNumberId = String(params.phoneNumberId || "").trim();
  const to = String(params.toStudentPhone || "").replace(/\D/g, "");
  const text = String(params.body || "").trim();

  if (!phoneNumberId) {
    throw new AppError("University phone_number_id is missing", 400);
  }
  if (!to) {
    throw new AppError("Student phone number is invalid", 400);
  }
  if (!text) {
    throw new AppError("Message body is required", 400);
  }

  // Meta WhatsApp Cloud API — send text as this university's registered number
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(
    phoneNumberId
  )}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  const raw: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    const metaMsg =
      raw?.error?.message ||
      raw?.error?.error_user_msg ||
      `Meta API error (${response.status})`;
    const code = raw?.error?.code;

    // Map common Meta failures to useful HTTP statuses
    if (response.status === 429 || code === 4 || code === 80007) {
      throw new AppError(`WhatsApp rate limit: ${metaMsg}`, 429);
    }
    if (code === 190 || response.status === 401) {
      throw new AppError(
        `WhatsApp access token expired or invalid: ${metaMsg}`,
        401
      );
    }
    if (code === 131026 || code === 131047 || code === 131051) {
      // undeliverable / outside window / unsupported
      throw new AppError(metaMsg, 400);
    }
    throw new AppError(metaMsg, response.status >= 400 && response.status < 600 ? response.status : 502);
  }

  const messageId =
    raw?.messages?.[0]?.id != null ? String(raw.messages[0].id) : null;

  return { messageId, raw };
}
