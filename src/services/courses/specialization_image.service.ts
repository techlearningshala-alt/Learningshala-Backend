import specializationImageRepo from "../../repositories/courses/specialization_image.repository";
import { CreateSpecializationImageDto, UpdateSpecializationImageDto } from "../../models/courses/specialization_image.model";

export const listSpecializationImages = (page = 1, limit = 10) => {
  return specializationImageRepo.findAll(page, limit);
};

export const listSpecializationImagesForSelect = () => {
  return specializationImageRepo.findAllForSelect();
};

export const getSpecializationImage = (id: number) => {
  return specializationImageRepo.findById(id);
};

export const createSpecializationImage = (item: CreateSpecializationImageDto) => {
  if (!item.name || !item.name.trim()) {
    throw new Error("Name is required");
  }
  if (!item.image || !item.image.trim()) {
    throw new Error("Image is required");
  }

  return specializationImageRepo.create({
    name: item.name.trim(),
    image: item.image.trim(),
  });
};

export const updateSpecializationImage = (id: number, item: UpdateSpecializationImageDto) => {
  const updateData: UpdateSpecializationImageDto = {};

  if (item.name !== undefined) {
    if (!item.name || !item.name.trim()) {
      throw new Error("Name cannot be empty");
    }
    updateData.name = item.name.trim();
  }

  if (item.image !== undefined) {
    if (!item.image || !item.image.trim()) {
      throw new Error("Image cannot be empty");
    }
    updateData.image = item.image.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  return specializationImageRepo.update(id, updateData);
};

export const deleteSpecializationImage = (id: number) => {
  return specializationImageRepo.delete(id);
};

