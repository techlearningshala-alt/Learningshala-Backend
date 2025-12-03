import leadRepository, {
  ListLeadOptions,
} from "../repositories/lead.repository";
import { CreateLeadDto } from "../models/lead.model";

const normalizeString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const normalizeCreatePayload = (payload: any): CreateLeadDto => {
  const name = normalizeString(payload.name);
  const email = normalizeString(payload.email);
  const phone = normalizeString(payload.phone);

  if (!name) {
    throw new Error("Name is required");
  }

  if (!phone && !email) {
    throw new Error("Either phone or email must be provided");
  }

  const normalized: CreateLeadDto = {
    name,
    email,
    phone,
    course: normalizeString(payload.course),
    specialisation: normalizeString(payload.specialisation),
    state: normalizeString(payload.state),
    city: normalizeString(payload.city),
    lead_source: normalizeString(payload.lead_source),
    sub_source: normalizeString(payload.sub_source),
    highest_qualification: normalizeString(payload.highest_qualification),
    preferred_budget: normalizeString(payload.preferred_budget),
    emi_required: normalizeString(payload.emi_required),
    salary: normalizeString(payload.salary),
    percentage: normalizeString(payload.percentage),
    experience: normalizeString(payload.experience),
    currently_employed: normalizeString(payload.currently_employed),
    university_for_placement_salaryhike_promotions: normalizeString(payload.university_for_placement_salaryhike_promotions),
    utm_source: normalizeString(payload.utm_source),
    utm_campaign: normalizeString(payload.utm_campaign),
    utm_adgroup: normalizeString(payload.utm_adgroup),
    utm_ads: normalizeString(payload.utm_ads),
    website_url: normalizeString(payload.website_url),
  };

  const createdOnValue = payload.created_on;
  if (createdOnValue) {
    const dateValue =
      createdOnValue instanceof Date ? createdOnValue : new Date(createdOnValue);
    if (!Number.isNaN(dateValue.getTime())) {
      normalized.created_on = dateValue;
    }
  } else {
    normalized.created_on = new Date();
  }

  return normalized;
};

export function listLeads(
  page = 1,
  limit = 10,
  options: ListLeadOptions = {}
) {
  return leadRepository.findAll(page, limit, options);
}

export function createLead(payload: any) {
  const normalized = normalizeCreatePayload(payload);
  return leadRepository.create(normalized);
}


