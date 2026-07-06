-- Run only if student_leads was already created with crm_lead_id
ALTER TABLE student_leads DROP INDEX idx_student_leads_crm_lead_id;
ALTER TABLE student_leads DROP COLUMN crm_lead_id;
