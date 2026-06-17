import { JoinWaitlist } from "../models/join_waitlist.model";
import { JoinWaitlistRepository } from "../repositories/join_waitlist.repository";

const normalizePhone = (val?: string | null) => {
  if (!val) return "";
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || "";
};

export async function createJoinWaitlist(payload: JoinWaitlist): Promise<JoinWaitlist> {
  const normalized: JoinWaitlist = {
    full_name: payload.full_name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: normalizePhone(payload.phone),
    certification_program: payload.certification_program.trim(),
  };

  return JoinWaitlistRepository.create(normalized);
}
