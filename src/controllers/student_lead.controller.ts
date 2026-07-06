import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import {
  createStudentLead,
  getStudentLeadById,
  listStudentLeads,
  updateStudentLead,
} from "../services/student_lead.service";

const STUDENT_LEAD_WEBHOOK_URL =
  process.env.WEBSITE_LEAD_WEBHOOK_URL_STUDENT_LEADS || "";

const postStudentLeadToWebhook = async (payload: Record<string, unknown>) => {
  if (!STUDENT_LEAD_WEBHOOK_URL) {
    console.warn("⚠️ WEBSITE_LEAD_WEBHOOK_URL_STUDENT_LEADS is not configured — skipping webhook");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(STUDENT_LEAD_WEBHOOK_URL, {
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

function buildStudentLeadWebhookPayload(lead: Awaited<ReturnType<typeof createStudentLead>>) {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email || "",
    phone: lead.phone || "",
    course: lead.chosenProgramme || "",
    qualification: lead.qualification || "",
    specialization: lead.specialization || "",
    goal: lead.goal || "",
    experience: lead.experience || "",
    budget: lead.budget || "",
    video_counselling_slot: lead.videoCounsellingSlot || null,
    preferred_callback_time: lead.preferredCallbackTime || "",
    admission_expert_requested: Boolean(lead.admissionExpertRequested),
    source: "Google",
    sub_source_new: "LS-Chatbot",
  };
}

export const create = async (req: Request, res: Response) => {
  try {
    const lead = await createStudentLead(req.body);

    const webhookPayload = buildStudentLeadWebhookPayload(lead);
    postStudentLeadToWebhook(webhookPayload).catch((webhookErr) => {
      console.error("⚠️ Student lead webhook failed:", webhookErr);
    });

    return successResponse(res, lead, "Student lead created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating student lead:", error);
    return errorResponse(res, error?.message || "Failed to create student lead", error?.statusCode || 400);
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate = typeof req.query.fromDate === "string" ? req.query.fromDate : undefined;
    const toDate = typeof req.query.toDate === "string" ? req.query.toDate : undefined;

    const result = await listStudentLeads(page, limit, { search, fromDate, toDate });
    return successResponse(res, result, "Student leads fetched successfully");
  } catch (error: any) {
    console.error("❌ Error listing student leads:", error);
    return errorResponse(res, error?.message || "Failed to fetch student leads", error?.statusCode || 500);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return errorResponse(res, "Invalid student lead ID", 400);
    }

    const lead = await getStudentLeadById(id);
    return successResponse(res, lead, "Student lead fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching student lead:", error);
    return errorResponse(res, error?.message || "Failed to fetch student lead", error?.statusCode || 500);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return errorResponse(res, "Invalid student lead ID", 400);
    }

    const lead = await updateStudentLead(id, req.body);
    return successResponse(res, lead, "Student lead updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating student lead:", error);
    return errorResponse(res, error?.message || "Failed to update student lead", error?.statusCode || 400);
  }
};
