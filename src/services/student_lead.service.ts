import {
  StudentLead,
  StudentLeadInput,
  VideoCounsellingSlot,
} from "../models/student_lead.model";
import {
  ListStudentLeadOptions,
  StudentLeadRepository,
} from "../repositories/student_lead.repository";

const normalizePhone = (val?: string | null) => {
  if (!val) return null;
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || null;
};

function toDbPayload(input: StudentLeadInput | Partial<StudentLeadInput>): Partial<StudentLead> {
  const out: Partial<StudentLead> = {};

  if (input.name !== undefined) out.name = input.name.trim();
  if (input.qualification !== undefined) out.qualification = input.qualification?.trim() || null;
  if (input.specialization !== undefined) out.specialization = input.specialization?.trim() || null;
  if (input.goal !== undefined) out.goal = input.goal?.trim() || null;
  if (input.phone !== undefined) out.phone = normalizePhone(input.phone);
  if (input.experience !== undefined) out.experience = input.experience?.trim() || null;
  if (input.budget !== undefined) out.budget = input.budget?.trim() || null;
  if (input.email !== undefined) out.email = input.email?.trim().toLowerCase() || null;
  if (input.chosenProgramme !== undefined) {
    out.chosen_programme = input.chosenProgramme?.trim() || null;
  }
  if (input.videoCounsellingSlot !== undefined) {
    out.video_counselling_slot = input.videoCounsellingSlot;
  }
  if (input.preferredCallbackTime !== undefined) {
    out.preferred_callback_time = input.preferredCallbackTime?.trim() || null;
  }
  if (input.admissionExpertRequested !== undefined) {
    out.admission_expert_requested = Boolean(input.admissionExpertRequested);
  }

  return out;
}

export function toClientLead(lead: StudentLead) {
  return {
    id: lead.id,
    name: lead.name,
    qualification: lead.qualification,
    specialization: lead.specialization,
    goal: lead.goal,
    phone: lead.phone,
    experience: lead.experience,
    budget: lead.budget,
    email: lead.email,
    chosenProgramme: lead.chosen_programme,
    videoCounsellingSlot: lead.video_counselling_slot as VideoCounsellingSlot | null,
    preferredCallbackTime: lead.preferred_callback_time,
    admissionExpertRequested: Boolean(lead.admission_expert_requested),
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
  };
}

export async function createStudentLead(payload: StudentLeadInput) {
  const normalized = toDbPayload(payload) as StudentLead;
  const created = await StudentLeadRepository.create(normalized);
  return toClientLead(created);
}

export async function listStudentLeads(
  page = 1,
  limit = 10,
  options: ListStudentLeadOptions = {}
) {
  const result = await StudentLeadRepository.findAll(page, limit, options);
  return {
    ...result,
    data: result.data.map(toClientLead),
  };
}

export async function getStudentLeadById(id: number) {
  const lead = await StudentLeadRepository.findById(id);
  if (!lead) {
    const err: any = new Error("Student lead not found");
    err.statusCode = 404;
    throw err;
  }
  return toClientLead(lead);
}

export async function updateStudentLead(id: number, payload: Partial<StudentLeadInput>) {
  const existing = await StudentLeadRepository.findById(id);
  if (!existing) {
    const err: any = new Error("Student lead not found");
    err.statusCode = 404;
    throw err;
  }

  const normalized = toDbPayload(payload);
  const updated = await StudentLeadRepository.update(id, normalized);
  if (!updated) {
    const err: any = new Error("Failed to update student lead");
    err.statusCode = 400;
    throw err;
  }
  return toClientLead(updated);
}
