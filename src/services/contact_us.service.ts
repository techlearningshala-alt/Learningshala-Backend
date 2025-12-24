import { ContactUs } from "../models/contact_us.model";
import { ContactUsRepository, ListContactUsOptions } from "../repositories/contact_us.repository";

const normalizeString = (val?: string | null) =>
  typeof val === "string" ? val.trim() || null : val ?? null;

const normalizePhone = (val?: string | null) => {
  if (!val) return "";
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || "";
};

export async function createContactUs(payload: ContactUs): Promise<ContactUs> {
  const normalized: ContactUs = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: normalizePhone(payload.phone),
    message: payload.message.trim(),
  };

  return ContactUsRepository.create(normalized);
}

export async function listContactUs(
  page = 1,
  limit = 10,
  options: ListContactUsOptions = {}
) {
  return ContactUsRepository.findAll(page, limit, options);
}

export async function getContactUsById(id: number): Promise<ContactUs | null> {
  return ContactUsRepository.findById(id);
}

export async function deleteContactUs(id: number): Promise<boolean> {
  return ContactUsRepository.delete(id);
}

