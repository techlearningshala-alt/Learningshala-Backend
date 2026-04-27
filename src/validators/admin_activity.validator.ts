import { z } from "zod";

export const createEditorActivityFromClientSchema = z.object({
  entity_type: z.string().trim().min(1).max(120),
  entity_id: z.coerce.number().int().positive(),
  page_key: z.string().trim().max(120).optional().nullable(),
  changed_fields: z
    .array(z.string().trim().min(1).max(600))
    .min(1)
    .max(2000),
});
