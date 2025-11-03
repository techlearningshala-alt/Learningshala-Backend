/**
 * EMI Partner Model
 * Represents a financing company/bank that partners with universities for EMI options
 * Note: Partners are managed globally and associated with universities via university.emi_partner_ids
 */

export interface EmiPartner {
  id: number;
  logo?: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO for creating a new EMI partner
 */
export interface CreateEmiPartnerDto {
  logo?: string;
  name?: string;
}

/**
 * DTO for updating an existing EMI partner
 */
export interface UpdateEmiPartnerDto {
  logo?: string;
  name?: string;
}

