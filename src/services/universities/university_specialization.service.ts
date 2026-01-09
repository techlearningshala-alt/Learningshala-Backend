import slugify from "slugify";
import specializationRepo from "../../repositories/universities/university_specialization.repository";
import {
  CreateUniversitySpecializationDto,
  UpdateUniversitySpecializationDto,
} from "../../models/universities/university_specialization.model";

interface ListSpecializationOptions {
  universityId?: number;
  universityCourseId?: number;
  search?: string;
}

const toNullableNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid numeric value provided");
  }
  return parsed;
};

const normaliseSpecializationPayload = (
  payload: any
): CreateUniversitySpecializationDto => {
  if (!payload.university_course_id) {
    throw new Error("university_course_id is required");
  }

  const name = String(payload.name || "").trim();
  if (!name) {
    throw new Error("Name is required");
  }

  const slug =
    (payload.slug ? String(payload.slug).trim() : "") ||
    slugify(name, { lower: true, strict: true });

  return {
    university_course_id: Number(payload.university_course_id),
    name,
    slug,
    full_fees: toNullableNumber(payload.full_fees),
    sem_fees: toNullableNumber(payload.sem_fees),
    duration: payload.duration ?? null,
    image: payload.image ?? null,
    label: payload.label ?? null,
    icon: payload.icon ?? null,
  };
};

export async function listUniversitySpecializations(
  page = 1,
  limit = 10,
  options: ListSpecializationOptions = {}
) {
  return specializationRepo.findAll(page, limit, options);
}

export async function getUniversitySpecializationById(id: number) {
  return specializationRepo.findById(id);
}

export async function getUniversitySpecializationOptions(
  universityCourseId: number
) {
  return specializationRepo.findOptionsByCourse(universityCourseId);
}

export async function createUniversitySpecialization(payload: any) {
  const normalized = normaliseSpecializationPayload(payload);
  return specializationRepo.create(normalized);
}

export async function updateUniversitySpecialization(
  id: number,
  payload: any
) {
  const normalized: UpdateUniversitySpecializationDto = {};

  if (payload.university_course_id !== undefined) {
    normalized.university_course_id = Number(payload.university_course_id);
  }

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw new Error("Name cannot be empty");
    }
    normalized.name = name;
    if (!payload.slug) {
      normalized.slug = slugify(name, { lower: true, strict: true });
    }
  }

  if (payload.slug !== undefined) {
    const slug = String(payload.slug).trim();
    normalized.slug =
      slug || slugify(String(normalized.name ?? ""), { lower: true, strict: true });
  }

  if (payload.full_fees !== undefined) {
    normalized.full_fees = toNullableNumber(payload.full_fees);
  }
  if (payload.sem_fees !== undefined) {
    normalized.sem_fees = toNullableNumber(payload.sem_fees);
  }
  if (payload.duration !== undefined) {
    normalized.duration = payload.duration ?? null;
  }
  if (payload.image !== undefined) {
    normalized.image = payload.image ?? null;
  }
  if (payload.label !== undefined) {
    normalized.label = payload.label ?? null;
  }
  if (payload.icon !== undefined) {
    normalized.icon = payload.icon ?? null;
  }
  if (payload.saveWithDate !== undefined) {
    normalized.saveWithDate =
      payload.saveWithDate === true || payload.saveWithDate === "true";
  }

  return specializationRepo.update(id, normalized);
}

export async function deleteUniversitySpecialization(id: number) {
  return specializationRepo.delete(id);
}
