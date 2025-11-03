import { EmiPartnerRepo } from "../../repositories/universities/emi-partner.repository";
import {
  EmiPartner,
  CreateEmiPartnerDto,
  UpdateEmiPartnerDto,
} from "../../models/universities/emi-partner.model";

/**
 * Create new EMI partner
 */
export const createEmiPartner = async (
  data: CreateEmiPartnerDto
): Promise<EmiPartner | null> => {
  try {
    const partnerId = await EmiPartnerRepo.createEmiPartner(data);
    
    // Fetch and return the created partner
    const partner = await EmiPartnerRepo.getEmiPartnerById(partnerId);
    return partner;
  } catch (error) {
    console.error("❌ Error in createEmiPartner service:", error);
    throw error;
  }
};

/**
 * Update EMI partner
 */
export const updateEmiPartner = async (
  id: number,
  data: UpdateEmiPartnerDto
): Promise<EmiPartner | null> => {
  try {
    // Fetch existing partner
    const existing = await EmiPartnerRepo.getEmiPartnerById(id);

    if (!existing) {
      return null;
    }

    // Keep old logo if new one not provided
    const updateData = {
      logo: data.logo || existing.logo,
      name: data.name !== undefined ? data.name : existing.name,
    };

    const updated = await EmiPartnerRepo.updateEmiPartner(id, updateData);

    if (!updated) {
      return null;
    }

    // Fetch and return updated partner
    const partner = await EmiPartnerRepo.getEmiPartnerById(id);
    return partner;
  } catch (error) {
    console.error("❌ Error in updateEmiPartner service:", error);
    throw error;
  }
};

/**
 * Get all EMI partners (with pagination)
 */
export const getAllEmiPartners = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    
    // Get paginated partners
    const partners = await EmiPartnerRepo.getAllEmiPartners(limit, offset);
    
    // Get total count
    const total = await EmiPartnerRepo.getTotalCount();
    
    return {
      data: partners,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("❌ Error in getAllEmiPartners service:", error);
    throw error;
  }
};

/**
 * Get single EMI partner by ID
 */
export const getEmiPartnerById = async (
  id: number
): Promise<EmiPartner | null> => {
  try {
    const partner = await EmiPartnerRepo.getEmiPartnerById(id);
    return partner;
  } catch (error) {
    console.error("❌ Error in getEmiPartnerById service:", error);
    throw error;
  }
};

/**
 * Delete EMI partner
 */
export const deleteEmiPartner = async (id: number): Promise<boolean> => {
  try {
    const exists = await EmiPartnerRepo.emiPartnerExists(id);

    if (!exists) {
      throw new Error("EMI partner not found");
    }

    const deleted = await EmiPartnerRepo.deleteEmiPartner(id);
    return deleted;
  } catch (error) {
    console.error("❌ Error in deleteEmiPartner service:", error);
    throw error;
  }
};

