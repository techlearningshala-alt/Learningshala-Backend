import feeTypeRepo, {
  ListFeeTypeOptions,
} from "../../repositories/universities/fee_type.repository";
import { CreateFeeTypeDto, UpdateFeeTypeDto } from "../../models/universities/fee_type.model";

const sanitizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normaliseCreatePayload = (payload: any): CreateFeeTypeDto => {
  const title = String(payload.title || "").trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const fee_key = sanitizeKey(title) || sanitizeKey(`fee_${Date.now()}`);

  return { title, fee_key };
};

const normaliseUpdatePayload = (payload: any): UpdateFeeTypeDto => {
  const updated: UpdateFeeTypeDto = {};

  if (payload.title !== undefined) {
    const title = String(payload.title).trim();
    if (!title) {
      throw new Error("Title cannot be empty");
    }
    updated.title = title;
  }

  return updated;
};

export async function listFeeTypes(
  page = 1,
  limit = 10,
  options: ListFeeTypeOptions = {}
) {
  return feeTypeRepo.findAll(page, limit, options);
}

export async function getFeeTypeById(id: number) {
  return feeTypeRepo.findById(id);
}

export async function createFeeType(payload: any) {
  const normalized = normaliseCreatePayload(payload);
  return feeTypeRepo.create(normalized);
}

export async function updateFeeType(id: number, payload: any) {
  const normalized = normaliseUpdatePayload(payload);
  return feeTypeRepo.update(id, normalized);
}

export async function deleteFeeType(id: number) {
  return feeTypeRepo.delete(id);
}


