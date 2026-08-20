import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import {
  createWebsiteLead,
  verifyWebsiteLeadOtp,
  listWebsiteLeads,
  updateInterestedUniversity,
  updateWebsiteLead,
  resolveCompareUniversities,
} from "../services/website_lead.service";
import { exportToExcel, ExcelColumn } from "../utills/excelExport";
import { mapCourseForCrm } from "../utills/crm-course-mapper";
import {
  getUtmMediumFromLeadUrl,
  META_PAID_SOURCE,
  META_PAID_SUB_SOURCE,
  shouldUseMetaPaidWebhook,
} from "../utills/traffic-type";
import { uploadToS3, getS3Url, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";
import { WebsiteLeadRepository } from "../repositories/website_lead.repository";

const WEBSITE_LEAD_WEBHOOK_URL =
  process.env.WEBSITE_LEAD_WEBHOOK_URL || "";

const WEBSITE_LEAD_META_WEBHOOK_URL =
  process.env.WEBSITE_LEAD_META_WEBHOOK_URL || "";

const WEBSITE_LEAD_WEBHOOK_URL_COUNSELLING_LEADS =
  process.env.WEBSITE_LEAD_WEBHOOK_URL_COUNSELLING_LEADS || "";

const COUNSELLING_FILTER_LEAD = "b2b_free_counselling";
const S3_FOLDER = "website-leads";
const FILE_FIELDS = ["resume", "report"] as const;
type FileField = (typeof FILE_FIELDS)[number];

const uploadLeadFiles = async (
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined
): Promise<Partial<Record<FileField, string>>> => {
  const uploaded: Partial<Record<FileField, string>> = {};
  if (!files) return uploaded;

  const list: Express.Multer.File[] = Array.isArray(files)
    ? files
    : Object.values(files).flat();

  for (const file of list) {
    const field = file.fieldname as FileField;
    if (!FILE_FIELDS.includes(field)) continue;
    const fileName = generateFileName(file.originalname);
    const key = await uploadToS3(file.buffer, fileName, S3_FOLDER, file.mimetype);
    uploaded[field] = key;
  }

  return uploaded;
};

const withFileUrls = <T extends Record<string, any>>(row: T): T => {
  const out: T = { ...row };
  for (const field of FILE_FIELDS) {
    if ((out as any)[field]) {
      (out as any)[field] = getS3Url(String((out as any)[field]));
    }
  }
  return out;
};

const postLeadToWebhook = async (
  payload: Record<string, unknown>,
  webhookUrl: string
) => {
  if (!webhookUrl) {
    throw new Error("Webhook URL is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Webhook HTTP ${response.status}${text ? `: ${text}` : ""}`);
    }
  } finally {
    clearTimeout(timeout);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadLeadFiles(req.files as any);
    const lead = await createWebsiteLead({
      ...req.body,
      ...uploadedFiles,
    });
    const requestBody: any = req.body || {};
    const crmCourse = mapCourseForCrm(requestBody.course || lead.course);
    const leadUrl = String(lead.lead_url || requestBody.lead_url || "").trim();
    const filterLead = String(
      lead.filter_lead || requestBody.filter_lead || ""
    ).trim();
    const isCounsellingLead = filterLead === COUNSELLING_FILTER_LEAD;
    const useMetaPaidWebhook =
      !isCounsellingLead && shouldUseMetaPaidWebhook(leadUrl);

    const sourceValue = useMetaPaidWebhook
      ? META_PAID_SOURCE
      : String(
          requestBody.source ||
            requestBody.utm_source ||
            lead.utm_source ||
            lead.lead_source ||
            ""
        ).trim();
    const subSourceValue = useMetaPaidWebhook
      ? META_PAID_SUB_SOURCE
      : String(requestBody.sub_source || lead.sub_source || "").trim();

    const utmMediumFromUrl = getUtmMediumFromLeadUrl(leadUrl) || "";

    const webhookPayload = {
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      course: crmCourse,
      specialisation: lead.specialization || "Not Decided Yet",
      state: lead.state || "",
      city: lead.city || "",
      source: sourceValue,
      sub_source_new: subSourceValue,
      website_url: "https://learningshala.com",
      lead_url: leadUrl,
      utm_source: sourceValue,
      utm_medium: requestBody.utm_medium || utmMediumFromUrl || "",
      utm_campaign: requestBody.utm_campaign || lead.utm_campaign || "",
      utm_content: requestBody.utm_content || "",
      utm_term: requestBody.utm_term || "",
      utm_matchtype: requestBody.utm_matchtype || "",
      question_fills: "No",
      questions: lead.questions ?? requestBody.questions ?? null,
      university: lead.university || requestBody.university || "",
      preferred_time: lead.preferred_time || requestBody.preferred_time || "",
      preferred_date: lead.preferred_date || requestBody.preferred_date || "",
      budget: lead.budget ?? requestBody.budget ?? "",
      message: lead.message || requestBody.message || "",
      filter_lead: filterLead || "",
      resume: lead.resume ? getS3Url(String(lead.resume)) : "",
      report: lead.report ? getS3Url(String(lead.report)) : "",
      compare_universities: resolveCompareUniversities(
        lead.interested_university,
        requestBody.interested_university
      ),
    };

    const webhookUrl = isCounsellingLead
      ? WEBSITE_LEAD_WEBHOOK_URL_COUNSELLING_LEADS
      : useMetaPaidWebhook
        ? WEBSITE_LEAD_META_WEBHOOK_URL
        : WEBSITE_LEAD_WEBHOOK_URL;

    // Non-blocking webhook: DB save succeeds even if webhook fails.
    postLeadToWebhook(webhookPayload, webhookUrl).catch((webhookErr) => {
      console.error("⚠️ Website lead webhook failed:", webhookErr);
    });

    // Exclude OTP from response for security
    const { otp, ...leadWithoutOtp } = lead;
    return successResponse(
      res,
      withFileUrls(leadWithoutOtp),
      "Website lead created successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating website lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create website lead",
      error?.statusCode || 400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid lead ID is required", 400);
    }

    const existing = await WebsiteLeadRepository.findById(id);
    if (!existing) {
      return errorResponse(res, "Website lead not found", 404);
    }

    const uploadedFiles = await uploadLeadFiles(req.files as any);

    // Replace old S3 files when new ones are uploaded
    for (const field of FILE_FIELDS) {
      if (uploadedFiles[field] && existing[field]) {
        deleteFromS3(String(existing[field])).catch(() => undefined);
      }
    }

    const updated = await updateWebsiteLead(id, {
      ...req.body,
      ...uploadedFiles,
    });

    if (!updated) {
      return errorResponse(res, "Website lead not found", 404);
    }

    const { otp, ...dataWithoutOtp } = updated as any;
    return successResponse(
      res,
      withFileUrls(dataWithoutOtp),
      "Website lead updated successfully"
    );
  } catch (error: any) {
    console.error("❌ Error updating website lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to update website lead",
      error?.statusCode || 400
    );
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;
    const trafficTypeRaw =
      typeof req.query.trafficType === "string" ? req.query.trafficType.trim().toLowerCase() : "";
    const trafficType = ["paid", "organic"].includes(trafficTypeRaw)
      ? trafficTypeRaw
      : undefined;
    const filterLead =
      typeof req.query.filterLead === "string" ? req.query.filterLead.trim() : undefined;
    const data = await listWebsiteLeads(page, limit, {
      search,
      fromDate,
      toDate,
      trafficType,
      filterLead,
    });
    return successResponse(
      res,
      {
        ...data,
        data: (data.data || []).map((row: any) => withFileUrls(row)),
      },
      "Website leads fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching website leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch website leads",
      error?.statusCode || 500
    );
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { otp } = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, "Valid lead ID is required", 400);
    }

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return errorResponse(res, "OTP must be exactly 6 digits", 400);
    }

    const isValid = await verifyWebsiteLeadOtp(id, otp);

    if (isValid) {
      return successResponse(res, { verified: true }, "OTP verified successfully");
    } else {
      return errorResponse(res, "Invalid OTP or lead ID", 400);
    }
  } catch (error: any) {
    console.error("❌ Error verifying OTP:", error);
    return errorResponse(
      res,
      error?.message || "Failed to verify OTP",
      error?.statusCode || 400
    );
  }
};

export const updateInterestedUniversityById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid lead ID is required", 400);
    }

    const updated = await updateInterestedUniversity(
      id,
      req.body?.interested_university
    );

    if (!updated) {
      return errorResponse(res, "Website lead not found", 404);
    }

    const { otp, ...dataWithoutOtp } = updated as any;
    return successResponse(
      res,
      withFileUrls(dataWithoutOtp),
      "Interested university updated successfully"
    );
  } catch (error: any) {
    console.error("❌ Error updating interested university:", error);
    return errorResponse(
      res,
      error?.message || "Failed to update interested university",
      error?.statusCode || 400
    );
  }
};

export const exportWebsiteLeads = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;
    const trafficTypeRaw =
      typeof req.query.trafficType === "string" ? req.query.trafficType.trim().toLowerCase() : "";
    const trafficType = ["paid", "organic"].includes(trafficTypeRaw)
      ? trafficTypeRaw
      : undefined;
    const filterLead =
      typeof req.query.filterLead === "string" ? req.query.filterLead.trim() : undefined;

    // Fetch all website leads with filters
    const data = await listWebsiteLeads(1, 100000, {
      search,
      fromDate,
      toDate,
      trafficType,
      filterLead,
    });
    const leads = data.data || [];
    const exportName =
      filterLead === COUNSELLING_FILTER_LEAD ? "B2B_Leads" : "Website_Leads";

    // Define Excel columns
    const columns: ExcelColumn[] = [
      { key: "name", header: "Name", width: 20 },
      { key: "email", header: "Email", width: 25 },
      { key: "phone", header: "Phone", width: 15 },
      { key: "course", header: "Course", width: 20 },
      { key: "specialization", header: "Specialization", width: 20 },
      { key: "state", header: "State", width: 15 },
      { key: "city", header: "City", width: 15 },
      { key: "lead_source", header: "Lead Source", width: 15 },
      { key: "sub_source", header: "Sub Source", width: 15 },
      { key: "traffic_type", header: "Traffic Type", width: 12 },
      { key: "utm_source", header: "UTM Source", width: 15 },
      { key: "utm_campaign", header: "UTM Campaign", width: 15 },
      { key: "utm_adgroup", header: "UTM Ad Group", width: 15 },
      { key: "utm_ads", header: "UTM Ads", width: 15 },
      { key: "website_url", header: "Website URL", width: 30 },
      {
        key: "interested_university",
        header: "Interested University",
        width: 30,
        getValue: (row) => {
          if (Array.isArray(row.interested_university)) {
            return row.interested_university.join(", ");
          }
          return row.interested_university || "-";
        },
      },
      { key: "preferred_date", header: "Preferred Date", width: 15 },
      { key: "preferred_time", header: "Preferred Time", width: 15 },
      { key: "budget", header: "Budget", width: 15 },
      { key: "message", header: "Message", width: 40 },
      { key: "resume", header: "Resume", width: 40 },
      { key: "report", header: "Report", width: 40 },
      {
        key: "created_at",
        header: "Created On",
        width: 20,
        getValue: (row) => {
          if (!row.created_at) return "-";
          const date = new Date(row.created_at);
          return isNaN(date.getTime())
            ? "-"
            : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`;
        },
      },
    ];

    await exportToExcel(
      res,
      leads.map((row: any) => withFileUrls(row)),
      columns,
      exportName
    );
  } catch (error: any) {
    console.error("❌ Error exporting website leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to export website leads",
      error?.statusCode || 500
    );
  }
};
