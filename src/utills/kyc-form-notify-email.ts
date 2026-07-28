import { transporter } from "../config/smtp";
import type { KycForm } from "../models/kyc_form.model";

const DEFAULT_KYC_NOTIFY_EMAIL = "eklovey@learningshala.in";
const EMAIL_BRAND_NAME = "Partner Learning Shala";
const CLOUDFRONT_BASE = "https://d34odytkc8nsi8.cloudfront.net";

const DOC_FIELDS = [
  "doc_id",
  "doc_pan",
  "doc_shop_addr",
  "doc_cheque",
  "doc_photo_out",
  "doc_photo_in",
] as const;

const FIELD_LABELS: Array<{ key: keyof KycForm | (typeof DOC_FIELDS)[number]; label: string }> = [
  { key: "id", label: "KYC ID" },
  { key: "full_name", label: "Full Name" },
  { key: "dob", label: "DOB" },
  { key: "mobile", label: "Mobile" },
  { key: "alt_mobile", label: "Alt Mobile" },
  { key: "email", label: "Email" },
  { key: "pan", label: "PAN" },
  { key: "aadhaar", label: "Aadhaar" },
  { key: "gender", label: "Gender" },
  { key: "shop_name", label: "Shop / Business Name" },
  { key: "biz_type", label: "Business Type" },
  { key: "address", label: "Address" },
  { key: "locality", label: "Locality" },
  { key: "city", label: "City" },
  { key: "pincode", label: "Pincode" },
  { key: "google_loc", label: "Google Location" },
  { key: "footfall", label: "Daily Student Footfall" },
  { key: "acc_holder", label: "Account Holder Name" },
  { key: "bank_name", label: "Bank Name" },
  { key: "acc_number", label: "Account Number" },
  { key: "ifsc", label: "IFSC" },
  { key: "upi", label: "UPI" },
  { key: "doc_id", label: "ID Proof" },
  { key: "doc_pan", label: "PAN" },
  { key: "doc_shop_addr", label: "Shop Address" },
  { key: "doc_cheque", label: "Cancelled Cheque / Passbook" },
  { key: "doc_photo_out", label: "Shop Photo Outside" },
  { key: "doc_photo_in", label: "Shop Photo Inside" },
  {
    key: "coi",
    label: "Is this partner related to, or associated with, the enrolling FMS",
  },
  { key: "coi_specify", label: "Is this partner related to(specify)" },
  { key: "declaration_agree", label: "Declaration Agree" },
];

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toCloudFrontUrl(value: string): string {
  const raw = String(value || "").trim();
  if (!raw || raw === "-") return "";
  if (raw.includes("d34odytkc8nsi8.cloudfront.net")) return raw;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      const path = parsed.pathname.replace(/^\//, "");
      return path ? `${CLOUDFRONT_BASE}/${path}` : CLOUDFRONT_BASE;
    } catch {
      // fall through
    }
  }

  return `${CLOUDFRONT_BASE}/${raw.replace(/^\//, "")}`;
}

function displayValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "declaration_agree") {
    return value === true || value === 1 || String(value).toLowerCase() === "true" ? "Yes" : "No";
  }
  if (DOC_FIELDS.includes(key as (typeof DOC_FIELDS)[number])) {
    return toCloudFrontUrl(String(value)) || "-";
  }
  return String(value);
}

export async function sendKycFormNotificationEmail(entry: KycForm): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("KYC notify email skipped: SMTP is not configured.");
    return;
  }

  const recipient =
    process.env.KYC_NOTIFY_EMAIL?.trim() || DEFAULT_KYC_NOTIFY_EMAIL;
  const name = entry.full_name?.trim() || "KYC Applicant";

  const rows = FIELD_LABELS.map(({ key, label }) => {
    const raw = (entry as any)[key];
    const value = displayValue(String(key), raw);
    const isDoc = DOC_FIELDS.includes(key as (typeof DOC_FIELDS)[number]) && value !== "-";
    const display = isDoc
      ? `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`
      : escapeHtml(value);
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:13px;width:220px;vertical-align:top;"><strong style="color:#0f172a;">${escapeHtml(label)}</strong></td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#334155;font-size:13px;word-break:break-word;">${display}</td>
    </tr>`;
  }).join("");

  const textLines = FIELD_LABELS.map(({ key, label }) => {
    const value = displayValue(String(key), (entry as any)[key]);
    return `${label}: ${value}`;
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"${EMAIL_BRAND_NAME}" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: `New KYC form submitted — ${name}`,
    text: [
      "A new KYC form has been submitted.",
      "",
      ...textLines,
      "",
      `— ${EMAIL_BRAND_NAME}`,
    ].join("\n"),
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New KYC form</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;width:100%;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#fff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#111827;padding:20px 28px;">
              <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">${escapeHtml(EMAIL_BRAND_NAME)}</p>
              <p style="margin:6px 0 0;color:#a1a1aa;font-size:13px;">New KYC form submission</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <h1 style="margin:0 0 8px;font-size:22px;color:#111;">KYC details</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#52525b;">A new KYC form was submitted successfully.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                ${rows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
