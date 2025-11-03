/**
 * Placement Partner Model
 * Represents a company/organization that partners with universities for placements
 * Note: Partners are managed globally and associated with universities via university.placement_partner_ids
 */

export interface PlacementPartner {
  id: number;
  logo?: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO for creating a new placement partner
 */
export interface CreatePlacementPartnerDto {
  logo?: string;
  name?: string;
}

/**
 * DTO for updating an existing placement partner
 */
export interface UpdatePlacementPartnerDto {
  logo?: string;
  name?: string;
}

/**
 * Extended placement partner with university information
 */
export interface PlacementPartnerWithUniversity extends PlacementPartner {
  university_name: string;
}

