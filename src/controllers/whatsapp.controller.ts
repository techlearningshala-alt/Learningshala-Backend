import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import * as WhatsAppService from "../services/whatsapp.service";
import { verifyWhatsAppSignature } from "../services/whatsapp_meta.client";

/** GET /webhook/whatsapp — Meta subscription verification */
export const webhookVerify = async (req: Request, res: Response) => {
  try {
    const challenge = WhatsAppService.verifyWhatsAppWebhookChallenge(
      req.query as any
    );
    if (challenge == null) {
      return res.status(403).send("Forbidden");
    }
    // Meta expects plain-text challenge, not JSON
    return res.status(200).send(challenge);
  } catch (error: any) {
    console.error("WhatsApp webhook verify error:", error);
    return res.status(500).send("Error");
  }
};

/** POST /webhook/whatsapp — inbound messages for ALL university numbers */
export const webhookReceive = async (req: Request, res: Response) => {
  try {
    const signature = req.header("x-hub-signature-256") || undefined;
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!rawBody || !verifyWhatsAppSignature(rawBody, signature)) {
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    // Always ack quickly; processing is lightweight DB writes
    const result = await WhatsAppService.processWhatsAppWebhookPayload(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("WhatsApp webhook receive error:", error);
    // Still 200 to reduce Meta retry storms on transient bugs; log for ops
    return res.status(200).json({ success: false, message: error?.message || "error" });
  }
};

export const listUniversities = async (_req: Request, res: Response) => {
  try {
    const data = await WhatsAppService.listWhatsAppUniversities();
    return successResponse(res, data, "WhatsApp universities fetched");
  } catch (error: any) {
    return errorResponse(res, error?.message || "Failed to list universities", error?.statusCode || 500);
  }
};

export const createUniversity = async (req: Request, res: Response) => {
  try {
    const data = await WhatsAppService.createWhatsAppUniversity(req.body);
    return successResponse(
      res,
      data,
      "WhatsApp university saved. phone_number_id is now wired for webhook + send.",
      201
    );
  } catch (error: any) {
    return errorResponse(res, error?.message || "Failed to create university", error?.statusCode || 400);
  }
};

export const updateUniversity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return errorResponse(res, "Valid id is required", 400);
    const data = await WhatsAppService.updateWhatsAppUniversity(id, req.body);
    if (!data) return errorResponse(res, "University not found", 404);
    return successResponse(res, data, "WhatsApp university updated");
  } catch (error: any) {
    return errorResponse(res, error?.message || "Failed to update university", error?.statusCode || 400);
  }
};

export const listConversations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || "1"), 10) || 1;
    const limit = parseInt(String(req.query.limit || "20"), 10) || 20;
    const universityId = req.query.university_id
      ? Number(req.query.university_id)
      : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const data = await WhatsAppService.listWhatsAppConversations({
      universityId: universityId && !Number.isNaN(universityId) ? universityId : undefined,
      status,
      page,
      limit,
    });
    return successResponse(res, data, "Conversations fetched");
  } catch (error: any) {
    return errorResponse(res, error?.message || "Failed to list conversations", error?.statusCode || 500);
  }
};

export const getConversationThread = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return errorResponse(res, "Valid conversation id is required", 400);
    const data = await WhatsAppService.getWhatsAppConversationThread(id);
    return successResponse(res, data, "Conversation thread fetched");
  } catch (error: any) {
    return errorResponse(res, error?.message || "Failed to fetch thread", error?.statusCode || 500);
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return errorResponse(res, "Valid conversation id is required", 400);
    const data = await WhatsAppService.sendWhatsAppReply(id, req.body.body);
    return successResponse(res, data, "Message sent", 201);
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to send message",
      error?.statusCode || 400
    );
  }
};

export const updateConversationStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return errorResponse(res, "Valid conversation id is required", 400);
    const data = await WhatsAppService.updateConversationStatus(id, req.body.status);
    return successResponse(res, data, "Conversation status updated");
  } catch (error: any) {
    return errorResponse(res, error?.message || "Failed to update status", error?.statusCode || 400);
  }
};
