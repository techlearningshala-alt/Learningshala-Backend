import { Request, Response, NextFunction } from "express";
import * as AuthorService from "../services/author.service";
import { createAuthorSchema, updateAuthorSchema } from "../validators/author.validator";
import { successResponse, errorResponse } from "../utills/response";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";
import { CreateAuthorDto, UpdateAuthorDto } from "../models/author.model";
import slugify from "slugify";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await AuthorService.listAuthors(page, limit);
    return successResponse(res, result, "Authors fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch authors", 500);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = await AuthorService.getAuthor(Number(req.params.id));
    if (!author) {
      return errorResponse(res, "Author not found", 404);
    }
    return successResponse(res, author, "Author fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch author", 500);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    if (!slug) return errorResponse(res, "Author slug is required", 400);
    const author = await AuthorService.getAuthorBySlug(slug);
    if (!author) return errorResponse(res, "Author not found", 404);
    return successResponse(res, author, "Author fetched successfully");
  }
  catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch author", 500);
  }
};  

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as any;
    let imageUrl: string | null = null;

    // Handle image upload if provided
    // upload.fields returns { image: [file] } format
    const imageFile = files?.image?.[0] || files?.image;
    if (imageFile) {
      const fileName = generateFileName(imageFile.originalname);
      imageUrl = await uploadToS3(
        imageFile.buffer,
        fileName,
        "authors",
        imageFile.mimetype
      );
    }

    const rawAuthorName = req.body.author_name;
    const rawSlug = req.body.author_slug;
    const generatedSlug = slugify(rawAuthorName, { lower: true, strict: true });
    const normalizedSlug =
      typeof rawSlug === "string" && rawSlug.trim().length ? rawSlug.trim() : generatedSlug;

    // Normalize empty strings coming from FormData -> null
    const metaTitle =
      typeof req.body.meta_title === "string" && req.body.meta_title.trim().length
        ? req.body.meta_title.trim()
        : null;

    const metaDescription =
      typeof req.body.meta_description === "string" && req.body.meta_description.trim().length
        ? req.body.meta_description
        : null;

    const body = {
      author_name: rawAuthorName,
      image: imageUrl ?? null,
      author_details: req.body.author_details ?? null,
      label: req.body.label ?? null,
      author_slug: normalizedSlug ?? null,
      meta_title: metaTitle,
      meta_description: metaDescription,
    };

    const validatedData = createAuthorSchema.parse(body);
    // Ensure all optional fields are null instead of undefined
    const createData: CreateAuthorDto = {
      author_name: validatedData.author_name,
      image: validatedData.image ?? null,
      author_details: validatedData.author_details ?? null,
      label: validatedData.label ?? null,
      author_slug: validatedData.author_slug ?? null,
      meta_title: validatedData.meta_title ?? null,
      meta_description: validatedData.meta_description ?? null,
    };
    const result = await AuthorService.createAuthor(createData);

    return successResponse(res, result, "Author created successfully", 201);
  } catch (err: any) {
    console.error("❌ Error creating author:", err);
    return errorResponse(res, err.message || "Failed to create author", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { saveWithDate, existingImage, ...rest } = req.body;
    const files = req.files as any;

    const saveDateFlag = saveWithDate === "true" || saveWithDate === true;

    // Get current author to delete old image from S3
    const currentAuthor: any = await AuthorService.getAuthor(Number(id));
    if (!currentAuthor) {
      return errorResponse(res, "Author not found", 404);
    }

    // Build updates object
    const updates: any = { ...rest };
    // Normalize empty string → null for optional nullable fields
    if (updates.author_slug === "") updates.author_slug = null;
    if (updates.meta_title === "") updates.meta_title = null;
    if (updates.meta_description === "") updates.meta_description = null;

    // Handle image upload
    const imageFile = files?.image?.[0] || files?.image;
    if (imageFile) {
      // New file uploaded → upload to S3
      const fileName = generateFileName(imageFile.originalname);
      updates.image = await uploadToS3(
        imageFile.buffer,
        fileName,
        "authors",
        imageFile.mimetype
      );

      // Delete old image from S3 if it exists and is not a local path
      if (
        currentAuthor?.image &&
        typeof currentAuthor.image === "string" &&
        !currentAuthor.image.startsWith("/uploads/")
      ) {
        await deleteFromS3(currentAuthor.image);
      }
    } else if (existingImage) {
      // No new file → keep existing image
      updates.image = existingImage;
    }

    const validatedData = updateAuthorSchema.parse(updates);
    // Ensure all optional fields are null instead of undefined
    const updateData: UpdateAuthorDto = {};
    if (validatedData.author_name !== undefined) updateData.author_name = validatedData.author_name;
    if (validatedData.image !== undefined) updateData.image = validatedData.image ?? null;
    if (validatedData.author_details !== undefined) updateData.author_details = validatedData.author_details ?? null;
    if (validatedData.label !== undefined) updateData.label = validatedData.label ?? null;
    if (validatedData.author_slug !== undefined) updateData.author_slug = validatedData.author_slug ?? null;
    if (validatedData.meta_title !== undefined) updateData.meta_title = validatedData.meta_title ?? null;
    if (validatedData.meta_description !== undefined) updateData.meta_description = validatedData.meta_description ?? null;
    
    const success = await AuthorService.updateAuthor(Number(id), updateData, saveDateFlag);

    if (!success) {
      return errorResponse(res, "Failed to update author", 500);
    }

    const updated = await AuthorService.getAuthor(Number(id));
    return successResponse(res, updated, "Author updated successfully");
  } catch (err: any) {
    console.error("❌ Error updating author:", err);
    return errorResponse(res, err.message || "Failed to update author", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    
    // Get author to delete image from S3
    const author: any = await AuthorService.getAuthor(id);
    if (!author) {
      return errorResponse(res, "Author not found", 404);
    }

    // Delete image from S3 if it exists
    if (author.image && typeof author.image === "string" && !author.image.startsWith("/uploads/")) {
      await deleteFromS3(author.image);
    }

    const success = await AuthorService.deleteAuthor(id);
    if (!success) {
      return errorResponse(res, "Failed to delete author", 500);
    }

    return successResponse(res, null, "Author deleted successfully");
  } catch (err: any) {
    console.error("❌ Error deleting author:", err);
    return errorResponse(res, err.message || "Failed to delete author", 500);
  }
};
