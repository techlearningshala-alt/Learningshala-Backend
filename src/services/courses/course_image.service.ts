import courseImageRepo from "../../repositories/courses/course_image.repository";
import { CreateCourseImageDto, UpdateCourseImageDto } from "../../models/courses/course_image.model";

export const listCourseImages = (page = 1, limit = 10) => {
  return courseImageRepo.findAll(page, limit);
};

export const listCourseImagesForSelect = () => {
  return courseImageRepo.findAllForSelect();
};

export const getCourseImage = (id: number) => {
  return courseImageRepo.findById(id);
};

export const createCourseImage = (item: CreateCourseImageDto) => {
  if (!item.name || !item.name.trim()) {
    throw new Error("Name is required");
  }
  if (!item.image || !item.image.trim()) {
    throw new Error("Image is required");
  }

  return courseImageRepo.create({
    name: item.name.trim(),
    image: item.image.trim(),
  });
};

export const updateCourseImage = (id: number, item: UpdateCourseImageDto) => {
  const updateData: UpdateCourseImageDto = {};

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

  return courseImageRepo.update(id, updateData);
};

export const deleteCourseImage = (id: number) => {
  return courseImageRepo.delete(id);
};

