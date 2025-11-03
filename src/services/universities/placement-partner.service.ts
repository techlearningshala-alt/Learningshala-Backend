import { PlacementPartnerRepo } from "../../repositories/universities/placement-partner.repository";
import {
  PlacementPartner,
  CreatePlacementPartnerDto,
  UpdatePlacementPartnerDto,
  PlacementPartnerWithUniversity,
} from "../../models/universities/placement-partner.model";

/**
 * Create new placement partner
 */
export const createPlacementPartner = async (
  data: CreatePlacementPartnerDto
): Promise<PlacementPartner | null> => {
  try {
    const partnerId = await PlacementPartnerRepo.createPlacementPartner(data);
    
    // Fetch and return the created partner
    const partner = await PlacementPartnerRepo.getPlacementPartnerById(partnerId);
    return partner;
  } catch (error) {
    console.error("❌ Error in createPlacementPartner service:", error);
    throw error;
  }
};

/**
 * Update placement partner
 */
export const updatePlacementPartner = async (
  id: number,
  data: UpdatePlacementPartnerDto
): Promise<PlacementPartner | null> => {
  try {
    // Fetch existing partner
    const existing = await PlacementPartnerRepo.getPlacementPartnerById(id);

    if (!existing) {
      return null;
    }

    // Keep old logo if new one not provided
    const updateData = {
      logo: data.logo || existing.logo,
      name: data.name !== undefined ? data.name : existing.name,
    };

    const updated = await PlacementPartnerRepo.updatePlacementPartner(id, updateData);

    if (!updated) {
      return null;
    }

    // Fetch and return updated partner
    const partner = await PlacementPartnerRepo.getPlacementPartnerById(id);
    return partner;
  } catch (error) {
    console.error("❌ Error in updatePlacementPartner service:", error);
    throw error;
  }
};

/**
 * Get all placement partners (with pagination)
 */
export const getAllPlacementPartners = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    
    // Get paginated partners
    const partners = await PlacementPartnerRepo.getAllPlacementPartners(limit, offset);
    
    // Get total count
    const total = await PlacementPartnerRepo.getTotalCount();
    
    return {
      data: partners,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("❌ Error in getAllPlacementPartners service:", error);
    throw error;
  }
};

/**
 * Get single placement partner by ID
 */
export const getPlacementPartnerById = async (
  id: number
): Promise<PlacementPartner | null> => {
  try {
    const partner = await PlacementPartnerRepo.getPlacementPartnerById(id);
    return partner;
  } catch (error) {
    console.error("❌ Error in getPlacementPartnerById service:", error);
    throw error;
  }
};

/**
 * Delete placement partner
 */
export const deletePlacementPartner = async (id: number): Promise<boolean> => {
  try {
    const deleted = await PlacementPartnerRepo.deletePlacementPartner(id);
    return deleted;
  } catch (error) {
    console.error("❌ Error in deletePlacementPartner service:", error);
    throw error;
  }
};

