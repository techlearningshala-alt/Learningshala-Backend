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

const normalizeUpdatePayload = (payload: any): Partial<CreateLeadDto> => {
  const normalized: Partial<CreateLeadDto> = {};

  if (payload.name !== undefined) {
    normalized.name = normalizeString(payload.name);
  }
  if (payload.email !== undefined) {
    normalized.email = normalizeString(payload.email);
  }
  if (payload.phone !== undefined) {
    normalized.phone = normalizeString(payload.phone);
  }
  if (payload.course !== undefined) {
    normalized.course = normalizeString(payload.course);
  }
  if (payload.specialisation !== undefined) {
    normalized.specialisation = normalizeString(payload.specialisation);
  }
  if (payload.state !== undefined) {
    normalized.state = normalizeString(payload.state);
  }
  if (payload.city !== undefined) {
    normalized.city = normalizeString(payload.city);
  }
  if (payload.lead_source !== undefined) {
    normalized.lead_source = normalizeString(payload.lead_source);
  }
  if (payload.sub_source !== undefined) {
    normalized.sub_source = normalizeString(payload.sub_source);
  }
  if (payload.highest_qualification !== undefined) {
    normalized.highest_qualification = normalizeString(payload.highest_qualification);
  }
  if (payload.preferred_budget !== undefined) {
    normalized.preferred_budget = normalizeString(payload.preferred_budget);
  }
  if (payload.emi_required !== undefined) {
    normalized.emi_required = normalizeString(payload.emi_required);
  }
  if (payload.salary !== undefined) {
    normalized.salary = normalizeString(payload.salary);
  }
  if (payload.percentage !== undefined) {
    normalized.percentage = normalizeString(payload.percentage);
  }
  if (payload.experience !== undefined) {
    normalized.experience = normalizeString(payload.experience);
  }
  if (payload.currently_employed !== undefined) {
    normalized.currently_employed = normalizeString(payload.currently_employed);
  }
  if (payload.university_for_placement_salaryhike_promotions !== undefined) {
    normalized.university_for_placement_salaryhike_promotions = normalizeString(
      payload.university_for_placement_salaryhike_promotions
    );
  }
  if (payload.utm_source !== undefined) {
    normalized.utm_source = normalizeString(payload.utm_source);
  }
  if (payload.utm_campaign !== undefined) {
    normalized.utm_campaign = normalizeString(payload.utm_campaign);
  }
  if (payload.utm_adgroup !== undefined) {
    normalized.utm_adgroup = normalizeString(payload.utm_adgroup);
  }
  if (payload.utm_ads !== undefined) {
    normalized.utm_ads = normalizeString(payload.utm_ads);
  }
  if (payload.website_url !== undefined) {
    normalized.website_url = normalizeString(payload.website_url);
  }

  if (payload.created_on !== undefined) {
    if (payload.created_on) {
      const dateValue =
        payload.created_on instanceof Date
          ? payload.created_on
          : new Date(payload.created_on);
      if (!Number.isNaN(dateValue.getTime())) {
        normalized.created_on = dateValue;
      }
    } else {
      normalized.created_on = null;
    }
  }

  return normalized;
};

export async function updateLeadByPhoneOrEmail(payload: any) {
  const phone = payload.phone ? normalizeString(payload.phone) : null;
  const email = payload.email ? normalizeString(payload.email) : null;

  if (!phone && !email) {
    throw new Error("Either phone or email must be provided to identify the lead");
  }

  // Find the lead by phone or email
  const existingLead = await leadRepository.findByPhoneOrEmail(phone, email);

  if (!existingLead) {
    throw new Error("Lead not found with the provided phone or email");
  }

  // Normalize the update payload
  const normalized = normalizeUpdatePayload(payload);

  // Update the lead
  const updated = await leadRepository.update(existingLead.id, normalized);

  if (!updated) {
    throw new Error("Failed to update lead");
  }

  return updated;
}


