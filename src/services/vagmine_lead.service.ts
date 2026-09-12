import { VagmineLead } from "../models/vagmine_lead.model";
import { VagmineLeadRepository } from "../repositories/vagmine_lead.repository";

const normalizeString = (val?: string | null) =>
  typeof val === "string" ? val.trim() : "";

export async function createVagmineLead(
  payload: VagmineLead
): Promise<VagmineLead> {
  const normalized: VagmineLead = {
    name: normalizeString(payload.name),
    email: normalizeString(payload.email),
    number: normalizeString(payload.number),
    message: normalizeString(payload.message),
  };

  if (!normalized.name) {
    const err: any = new Error("Name is required");
    err.statusCode = 400;
    throw err;
  }
  if (!normalized.email) {
    const err: any = new Error("Email is required");
    err.statusCode = 400;
    throw err;
  }
  if (!normalized.number) {
    const err: any = new Error("Number is required");
    err.statusCode = 400;
    throw err;
  }
  if (!normalized.message) {
    const err: any = new Error("Message is required");
    err.statusCode = 400;
    throw err;
  }

  return VagmineLeadRepository.create(normalized);
}
