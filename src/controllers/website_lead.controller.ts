import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import {
  createWebsiteLead,
  verifyWebsiteLeadOtp,
  listWebsiteLeads,
  updateInterestedUniversity,
} from "../services/website_lead.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { exportToExcel, ExcelColumn } from "../utills/excelExport";

const WEBSITE_LEAD_WEBHOOK_URL =
  process.env.WEBSITE_LEAD_WEBHOOK_URL || "";

const postLeadToWebhook = async (payload: Record<string, unknown>) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(WEBSITE_LEAD_WEBHOOK_URL, {
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
    const lead = await createWebsiteLead(req.body);
    const requestBody: any = req.body || {};

    const webhookPayload = {
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      course: lead.course || "",
      specialisation: lead.specialization || "Not Decided Yet",
      state: lead.state || "",
      city: lead.city || "",
      lead_source: lead.lead_source || "ignou",
      sub_source: lead.sub_source || requestBody.sub_source || "",
      website_url:
        lead.website_url || requestBody.website_url || process.env.WEBSITE_URL || "",
      utm_source: requestBody.utm_source || lead.utm_source || "",
      utm_medium: requestBody.utm_medium || "",
      utm_campaign: requestBody.utm_campaign || lead.utm_campaign || "",
      utm_content: requestBody.utm_content || "",
      utm_term: requestBody.utm_term || "",
      utm_matchtype: requestBody.utm_matchtype || "",
      question_fills: requestBody.question_fills || "No",
      university: requestBody.university || "No University",
    };

    // Non-blocking webhook: DB save succeeds even if webhook fails.
    postLeadToWebhook(webhookPayload).catch((webhookErr) => {
      console.error("⚠️ Website lead webhook failed:", webhookErr);
    });

    // Exclude OTP from response for security
    const { otp, ...leadWithoutOtp } = lead;
    return successResponse(res, leadWithoutOtp, "Website lead created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating website lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create website lead",
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
    const data = await listWebsiteLeads(page, limit, { search, fromDate, toDate });
    return successResponse(res, data, "Website leads fetched successfully");
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
      dataWithoutOtp,
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

    // Fetch all website leads with filters
    const data = await listWebsiteLeads(1, 100000, { search, fromDate, toDate });
    const leads = data.data || [];

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

    await exportToExcel(res, leads, columns, "Website_Leads");
  } catch (error: any) {
    console.error("❌ Error exporting website leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to export website leads",
      error?.statusCode || 500
    );
  }
};
