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

/**
 * Preserve exact string value as received from payload
 * This is used for question-based fields to keep exact values like "₹3 Lakh to ₹6 Lakh", "Yes", etc.
 */
const preserveExactValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  // Convert to string and preserve the exact value without trimming
  // This preserves special characters, spaces, currency symbols, etc.
  return String(value);
};

/**
 * Maps question-based payload keys to database column names
 */
const mapPayloadKeysToDbColumns = (payload: any): any => {
  const keyMapping: Record<string, string> = {
    'what_is_your_preferred_budget_for_the_total_course_fee': 'preferred_budget',
    'would_you_prefer_to_convert_the_course_fee_into_easy_emis': 'emi_required',
    'what_is_your_current_annual_salary_package': 'salary',
    'what_was_your_percentage_in_graduation': 'percentage',
    'how_many_years_of_experience_do_you_have': 'experience',
    'are_you_looking_for_a_university_that_can_help_you_with_placement_salary_hike_or_promotions': 'university_for_placement_salaryhike_promotions',
    'are_you_currently_employed': 'currently_employed',
  };

  const mapped: any = { ...payload };

  // Map question-based keys to database column names
  Object.keys(keyMapping).forEach((questionKey) => {
    if (payload[questionKey] !== undefined) {
      mapped[keyMapping[questionKey]] = payload[questionKey];
      // Remove the question key if it's different from the mapped key
      if (questionKey !== keyMapping[questionKey]) {
        delete mapped[questionKey];
      }
    }
  });

  return mapped;
};

/**
 * Maps database column names back to question-based keys for API responses
 */
const mapDbColumnsToQuestionKeys = (lead: any): any => {
  if (!lead) return lead;

  const reverseMapping: Record<string, string> = {
    'preferred_budget': 'what_is_your_preferred_budget_for_the_total_course_fee',
    'emi_required': 'would_you_prefer_to_convert_the_course_fee_into_easy_emis',
    'salary': 'what_is_your_current_annual_salary_package',
    'percentage': 'what_was_your_percentage_in_graduation',
    'experience': 'how_many_years_of_experience_do_you_have',
    'university_for_placement_salaryhike_promotions': 'are_you_looking_for_a_university_that_can_help_you_with_placement_salary_hike_or_promotions',
    'currently_employed': 'are_you_currently_employed',
  };

  const mapped: any = { ...lead };

  // Map database column names back to question keys
  Object.keys(reverseMapping).forEach((dbKey) => {
    if (lead[dbKey] !== undefined) {
      mapped[reverseMapping[dbKey]] = lead[dbKey];
      // Remove the db key if it's different from the question key
      if (dbKey !== reverseMapping[dbKey]) {
        delete mapped[dbKey];
      }
    }
  });

  return mapped;
};

const normalizeCreatePayload = (payload: any): CreateLeadDto => {
  // First map question-based keys to database column names
  const mappedPayload = mapPayloadKeysToDbColumns(payload);
  
  const name = normalizeString(mappedPayload.name);
  const email = normalizeString(mappedPayload.email);
  const phone = normalizeString(mappedPayload.phone);

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
    course: normalizeString(mappedPayload.course),
    university: normalizeString(mappedPayload.university),
    specialisation: normalizeString(mappedPayload.specialisation),
    state: normalizeString(mappedPayload.state),
    city: normalizeString(mappedPayload.city),
    lead_source: normalizeString(mappedPayload.lead_source),
    sub_source: normalizeString(mappedPayload.sub_source),
    highest_qualification: preserveExactValue(mappedPayload.highest_qualification),
    preferred_budget: preserveExactValue(mappedPayload.preferred_budget),
    emi_required: preserveExactValue(mappedPayload.emi_required),
    salary: preserveExactValue(mappedPayload.salary),
    percentage: preserveExactValue(mappedPayload.percentage),
    experience: preserveExactValue(mappedPayload.experience),
    currently_employed: preserveExactValue(mappedPayload.currently_employed),
    university_for_placement_salaryhike_promotions: preserveExactValue(mappedPayload.university_for_placement_salaryhike_promotions),
    utm_source: normalizeString(mappedPayload.utm_source),
    utm_campaign: normalizeString(mappedPayload.utm_campaign),
    utm_adgroup: normalizeString(mappedPayload.utm_adgroup),
    utm_ads: normalizeString(mappedPayload.utm_ads),
    website_url: normalizeString(mappedPayload.website_url),
  };

  const createdOnValue = mappedPayload.created_on;
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

export async function listLeads(
  page = 1,
  limit = 10,
  options: ListLeadOptions = {}
) {
  const data = await leadRepository.findAll(page, limit, options);
  return {
    ...data,
    data: data.data.map((lead: any) => mapDbColumnsToQuestionKeys(lead)),
  };
}

export async function createLead(payload: any) {
  const normalized = normalizeCreatePayload(payload);
  const lead = await leadRepository.create(normalized);
  return mapDbColumnsToQuestionKeys(lead);
}

const normalizeUpdatePayload = (payload: any): Partial<CreateLeadDto> => {
  // First map question-based keys to database column names
  const mappedPayload = mapPayloadKeysToDbColumns(payload);
  
  const normalized: Partial<CreateLeadDto> = {};

  if (mappedPayload.name !== undefined) {
    normalized.name = normalizeString(mappedPayload.name);
  }
  if (mappedPayload.email !== undefined) {
    normalized.email = normalizeString(mappedPayload.email);
  }
  if (mappedPayload.phone !== undefined) {
    normalized.phone = normalizeString(mappedPayload.phone);
  }
  if (mappedPayload.course !== undefined) {
    normalized.course = normalizeString(mappedPayload.course);
  }
  if (mappedPayload.university !== undefined) {
    normalized.university = normalizeString(mappedPayload.university);
  }
  if (mappedPayload.specialisation !== undefined) {
    normalized.specialisation = normalizeString(mappedPayload.specialisation);
  }
  if (mappedPayload.state !== undefined) {
    normalized.state = normalizeString(mappedPayload.state);
  }
  if (mappedPayload.city !== undefined) {
    normalized.city = normalizeString(mappedPayload.city);
  }
  if (mappedPayload.lead_source !== undefined) {
    normalized.lead_source = normalizeString(mappedPayload.lead_source);
  }
  if (mappedPayload.sub_source !== undefined) {
    normalized.sub_source = normalizeString(mappedPayload.sub_source);
  }
  if (mappedPayload.highest_qualification !== undefined) {
    normalized.highest_qualification = preserveExactValue(mappedPayload.highest_qualification);
  }
  if (mappedPayload.preferred_budget !== undefined) {
    normalized.preferred_budget = preserveExactValue(mappedPayload.preferred_budget);
  }
  if (mappedPayload.emi_required !== undefined) {
    normalized.emi_required = preserveExactValue(mappedPayload.emi_required);
  }
  if (mappedPayload.salary !== undefined) {
    normalized.salary = preserveExactValue(mappedPayload.salary);
  }
  if (mappedPayload.percentage !== undefined) {
    normalized.percentage = preserveExactValue(mappedPayload.percentage);
  }
  if (mappedPayload.experience !== undefined) {
    normalized.experience = preserveExactValue(mappedPayload.experience);
  }
  if (mappedPayload.currently_employed !== undefined) {
    normalized.currently_employed = preserveExactValue(mappedPayload.currently_employed);
  }
  if (mappedPayload.university_for_placement_salaryhike_promotions !== undefined) {
    normalized.university_for_placement_salaryhike_promotions = preserveExactValue(
      mappedPayload.university_for_placement_salaryhike_promotions
    );
  }
  if (mappedPayload.utm_source !== undefined) {
    normalized.utm_source = normalizeString(mappedPayload.utm_source);
  }
  if (mappedPayload.utm_campaign !== undefined) {
    normalized.utm_campaign = normalizeString(mappedPayload.utm_campaign);
  }
  if (mappedPayload.utm_adgroup !== undefined) {
    normalized.utm_adgroup = normalizeString(mappedPayload.utm_adgroup);
  }
  if (mappedPayload.utm_ads !== undefined) {
    normalized.utm_ads = normalizeString(mappedPayload.utm_ads);
  }
  if (mappedPayload.website_url !== undefined) {
    normalized.website_url = normalizeString(mappedPayload.website_url);
  }

  if (mappedPayload.created_on !== undefined) {
    if (mappedPayload.created_on) {
      const dateValue =
        mappedPayload.created_on instanceof Date
          ? mappedPayload.created_on
          : new Date(mappedPayload.created_on);
      if (!Number.isNaN(dateValue.getTime())) {
        normalized.created_on = dateValue;
      }
    } else {
      normalized.created_on = null;
    }
  }

  return normalized;
};

export async function getLeadByPhone(phone: string) {
  if (!phone) {
    throw new Error("Phone number is required");
  }
  // Normalize phone: remove all non-numeric characters for consistent matching
  const normalizedPhone = String(phone).trim().replace(/\D/g, '');
  if (!normalizedPhone || normalizedPhone.length === 0) {
    throw new Error("Phone number is required");
  }
  const leads = await leadRepository.findByPhone(normalizedPhone);
  if (!leads || leads.length === 0) {
    throw new Error("Lead not found");
  }
  return leads.map((lead: any) => mapDbColumnsToQuestionKeys(lead));
}

export async function updateLeadByPhone(payload: any) {
  const phone = payload.phone ? normalizeString(payload.phone) : null;

  if (!phone) {
    throw new Error("Phone number is required to identify the lead");
  }

  // Normalize phone: remove all non-numeric characters for consistent matching
  const normalizedPhone = String(phone).trim().replace(/\D/g, '');
  if (!normalizedPhone || normalizedPhone.length === 0) {
    throw new Error("Phone number is required");
  }

  // Find the lead by phone
  const existingLeads = await leadRepository.findByPhone(normalizedPhone);

  if (!existingLeads || existingLeads.length === 0) {
    throw new Error("Lead not found with the provided phone number");
  }

  // Use the first (most recent) lead if multiple exist
  const existingLead = existingLeads[0];

  // Normalize the update payload
  const normalized = normalizeUpdatePayload(payload);

  // Update the lead
  const updated = await leadRepository.update(existingLead.id, normalized);

  if (!updated) {
    throw new Error("Failed to update lead");
  }

  return mapDbColumnsToQuestionKeys(updated);
}


