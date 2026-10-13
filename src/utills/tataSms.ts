export type TataSmsSendResult = {
  campaignId?: string;
  jobId?: string;
  cusTmId?: string;
  raw: unknown;
};

const requireEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
};

/** Normalize to 10-digit Indian mobile, then prefix 91 for Tata recipient. */
export const toTataRecipient = (phone: string): string => {
  const digits = String(phone || "").replace(/\D/g, "");
  let local = digits;
  if (local.length === 12 && local.startsWith("91")) {
    local = local.slice(2);
  } else if (local.length === 11 && local.startsWith("0")) {
    local = local.slice(1);
  }
  if (local.length !== 10) {
    throw new Error("Phone must be a valid 10-digit mobile number");
  }
  return `91${local}`;
};

export const buildOtpMessage = (otp: string): string => {
  const template =
    process.env.TATA_SMS_MSG_TEMPLATE ||
    "Welcome to LearningShala! Your OTP for login is: {{otp}}. It is valid for 10 minutes.";
  return template.replace(/\{\{\s*otp\s*\}\}/gi, otp).replace(/\{otp\}/gi, otp);
};

export async function sendTataOtpSms(
  phone: string,
  otp: string
): Promise<TataSmsSendResult> {
  const baseUrl = requireEnv("TATA_SMS_BASE_URL");
  const user = requireEnv("TATA_SMS_USER");
  const pswd = requireEnv("TATA_SMS_PSWD");
  const sender = requireEnv("TATA_SMS_SENDER");
  const peId = requireEnv("TATA_SMS_PE_ID");
  const templateId = requireEnv("TATA_SMS_TEMPLATE_ID");
  const dr = (process.env.TATA_SMS_DR || "false").trim();

  const recipient = toTataRecipient(phone);
  const msg = buildOtpMessage(otp);

  const url = new URL(baseUrl);
  url.searchParams.set("recipient", recipient);
  url.searchParams.set("dr", dr);
  url.searchParams.set("msg", msg);
  url.searchParams.set("user", user);
  url.searchParams.set("pswd", pswd);
  url.searchParams.set("sender", sender);
  url.searchParams.set("PE_ID", peId);
  url.searchParams.set("Template_ID", templateId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await response.text();
  let raw: unknown = text;
  try {
    raw = JSON.parse(text);
  } catch {
    // keep raw text
  }

  if (!response.ok) {
    throw new Error(`Failed to send OTP SMS (status ${response.status})`);
  }

  const data = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  return {
    campaignId: data.campaignId ? String(data.campaignId) : undefined,
    jobId: data.jobId ? String(data.jobId) : undefined,
    cusTmId: data.cusTmId ? String(data.cusTmId) : undefined,
    raw,
  };
}
