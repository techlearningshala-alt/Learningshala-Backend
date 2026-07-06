import { z } from "zod";

const optionalTrimmed = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .or(z.literal("").transform(() => undefined));

const videoCounsellingSlotSchema = z
  .object({
    date: z.string().trim().min(1, "Video counselling date is required").max(50),
    time: z.string().trim().min(1, "Video counselling time is required").max(50),
  })
  .optional()
  .nullable();

const studentLeadFields = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(150, "Name must be at most 150 characters"),
  qualification: optionalTrimmed("Qualification"),
  specialization: optionalTrimmed("Specialization"),
  goal: optionalTrimmed("Goal", 500),
  phone: optionalTrimmed("Phone", 20),
  experience: optionalTrimmed("Experience", 100),
  budget: optionalTrimmed("Budget", 100),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  chosenProgramme: optionalTrimmed("Chosen programme"),
  videoCounsellingSlot: videoCounsellingSlotSchema,
  preferredCallbackTime: optionalTrimmed("Preferred callback time", 100),
  admissionExpertRequested: z.boolean().optional(),
};

export const createStudentLeadSchema = z.object(studentLeadFields);

export const updateStudentLeadSchema = z
  .object({
    ...studentLeadFields,
    name: studentLeadFields.name.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
