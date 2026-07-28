import { KycForm } from "../models/kyc_form.model";
import { KycFormRepository, ListKycFormOptions } from "../repositories/kyc_form.repository";

const normalizeString = (val?: string | null) =>
  typeof val === "string" ? val.trim() || null : val ?? null;

const normalizePhone = (val?: string | null) => {
  if (!val) return null;
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || null;
};

const toBool = (val?: boolean | number | string | null) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === 1;
  if (typeof val === "string") {
    const normalized = val.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

export async function createKycForm(payload: KycForm): Promise<KycForm> {
  const mobile = normalizePhone(payload.mobile);
  if (!mobile) {
    const err: any = new Error("Valid mobile number is required");
    err.statusCode = 400;
    throw err;
  }

  const normalized: KycForm = {
    full_name: payload.full_name.trim(),
    dob: normalizeString(payload.dob),
    mobile,
    alt_mobile: normalizePhone(payload.alt_mobile),
    email: payload.email.trim().toLowerCase(),
    pan: normalizeString(payload.pan)?.toUpperCase() ?? null,
    aadhaar: normalizePhone(payload.aadhaar),
    gender: normalizeString(payload.gender),
    shop_name: normalizeString(payload.shop_name),
    biz_type: normalizeString(payload.biz_type),
    address: normalizeString(payload.address),
    locality: normalizeString(payload.locality),
    city: normalizeString(payload.city),
    pincode: normalizeString(payload.pincode),
    google_loc: normalizeString(payload.google_loc),
    footfall: normalizeString(payload.footfall),
    acc_holder: normalizeString(payload.acc_holder),
    bank_name: normalizeString(payload.bank_name),
    acc_number: normalizeString(payload.acc_number),
    ifsc: normalizeString(payload.ifsc)?.toUpperCase() ?? null,
    upi: normalizeString(payload.upi),
    doc_id: normalizeString(payload.doc_id),
    doc_pan: normalizeString(payload.doc_pan),
    doc_shop_addr: normalizeString(payload.doc_shop_addr),
    doc_cheque: normalizeString(payload.doc_cheque),
    doc_photo_out: normalizeString(payload.doc_photo_out),
    doc_photo_in: normalizeString(payload.doc_photo_in),
    coi: normalizeString(payload.coi),
    coi_specify: normalizeString(payload.coi_specify),
    declaration_agree: toBool(payload.declaration_agree),
  };

  return KycFormRepository.create(normalized);
}

export async function listKycForms(
  page = 1,
  limit = 10,
  options: ListKycFormOptions = {}
) {
  return KycFormRepository.findAll(page, limit, options);
}

export async function getKycFormById(id: number) {
  return KycFormRepository.findById(id);
}
