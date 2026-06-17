import { PartnerWithUs } from "../models/partner_with_us.model";
import { PartnerWithUsRepository } from "../repositories/partner_with_us.repository";

const normalizePhone = (val?: string | null) => {
  if (!val) return "";
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || "";
};

export async function createPartnerWithUs(payload: PartnerWithUs): Promise<PartnerWithUs> {
  const normalized: PartnerWithUs = {
    institution_name: payload.institution_name.trim(),
    contact_person_name: payload.contact_person_name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: normalizePhone(payload.phone),
    designation: payload.designation.trim(),
  };

  return PartnerWithUsRepository.create(normalized);
}
