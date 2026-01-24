import { Request, Response, NextFunction } from "express";
import { BlogService } from "../../services/blogs/blog.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;

    const result = await BlogService.list(page, limit, { search, category_id });

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "Blogs fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await BlogService.get(Number(req.params.id));
    if (!blog) return errorResponse(res, "Blog not found", 404);
    return successResponse(res, blog, "Blog fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = { ...req.body };
    const files = req.files as { author_image?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };

    // Handle author image upload
    if (files?.author_image?.[0]) {
      const file = files.author_image[0];
      const fileName = generateFileName(file.originalname);
      body.author_image = await uploadToS3(
        file.buffer,
        fileName,
        "blogs/authors",
        file.mimetype
      );
    }

    // Handle thumbnail upload
    if (files?.thumbnail?.[0]) {
      const file = files.thumbnail[0];
      const fileName = generateFileName(file.originalname);
      body.thumbnail = await uploadToS3(
        file.buffer,
        fileName,
        "blogs/thumbnails",
        file.mimetype
      );
    }

    const blog = await BlogService.create(body);
    return successResponse(res, blog, "Blog created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create blog", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = { ...req.body };
    const files = req.files as { author_image?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };

    // Handle author image upload or removal
    if (files?.author_image?.[0]) {
      const file = files.author_image[0];
      const fileName = generateFileName(file.originalname);
      body.author_image = await uploadToS3(
        file.buffer,
        fileName,
        "blogs/authors",
        file.mimetype
      );
    } else if (body.author_image === "" || body.author_image === "null") {
      // Image was removed
      body.author_image = null;
    }

    // Handle thumbnail upload or removal
    if (files?.thumbnail?.[0]) {
      const file = files.thumbnail[0];
      const fileName = generateFileName(file.originalname);
      body.thumbnail = await uploadToS3(
        file.buffer,
        fileName,
        "blogs/thumbnails",
        file.mimetype
      );
    } else if (body.thumbnail === "" || body.thumbnail === "null") {
      // Thumbnail was removed
      body.thumbnail = null;
    }

    const updated = await BlogService.update(Number(req.params.id), body);
    if (!updated) return errorResponse(res, "Blog not found", 404);
    return successResponse(res, null, "Blog updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update blog", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await BlogService.delete(Number(req.params.id));
    return successResponse(res, null, "Blog deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const toggleVerified = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const verified = req.body.verified === true || req.body.verified === "true" || req.body.verified === 1;

    const blog = await BlogService.toggleVerified(id, verified);

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, blog, "Blog verification status toggled successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to toggle blog verification status", 400);
  }
};
