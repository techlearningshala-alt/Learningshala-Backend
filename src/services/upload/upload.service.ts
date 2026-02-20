import uploadRepo from "../../repositories/upload/upload.repository";
import { CreateUploadDto, UpdateUploadDto } from "../../models/upload/upload.model";

export const listUploads = (page = 1, limit = 10) => {
  return uploadRepo.findAll(page, limit);
};

export const getUpload = (id: number) => {
  return uploadRepo.findById(id);
};

export const getUploadByFilePath = (filePath: string) => {
  return uploadRepo.findByFilePath(filePath);
};

export const createUpload = (item: CreateUploadDto) => {
  if (!item.file_path || !item.file_path.trim()) {
    throw new Error("File path is required");
  }
  if (!item.file_type || !["image", "pdf", "video"].includes(item.file_type)) {
    throw new Error("File type must be image, pdf, or video");
  }

  return uploadRepo.create({
    name: item.name?.trim() || null,
    file_path: item.file_path.trim(),
    file_type: item.file_type,
  });
};

export const updateUpload = (id: number, item: UpdateUploadDto) => {
  const updateData: UpdateUploadDto = {};

  if (item.name !== undefined) {
    updateData.name = item.name?.trim() ?? null;
  }
  if (item.file_path !== undefined) {
    if (!item.file_path || !item.file_path.trim()) {
      throw new Error("File path cannot be empty");
    }
    updateData.file_path = item.file_path.trim();
  }
  if (item.file_type !== undefined) {
    if (!["image", "pdf", "video"].includes(item.file_type)) {
      throw new Error("File type must be image, pdf, or video");
    }
    updateData.file_type = item.file_type;
  }

  if (Object.keys(updateData).length === 0) {
    return uploadRepo.findById(id);
  }

  return uploadRepo.update(id, updateData);
};

export const deleteUpload = (id: number) => {
  return uploadRepo.delete(id);
};
