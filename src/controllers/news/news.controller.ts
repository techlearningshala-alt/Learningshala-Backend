import { Request, Response, NextFunction } from "express";
import { NewsService } from "../../services/news/news.service";
import { NewsFaqService } from "../../services/news/news_faq.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;

    const result = await NewsService.list(page, limit, { search, category_id });

    const pages = Math.ceil(result.total / limit);

    return successResponse(
      res,
      {
        data: result.data,
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages,
      },
      "News fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const getByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categorySlug = req.params.categorySlug as string;
    if (!categorySlug || categorySlug.trim() === "") {
      return errorResponse(res, "Category slug is required", 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const result = await NewsService.listByCategorySlug(page, limit, categorySlug, { search });

    const pages = Math.ceil(result.total / limit);

    return successResponse(
      res,
      {
        data: result.data,
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages,
      },
      "News fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugOrId = String(req.params.slug || "").trim();
    if (!slugOrId) {
      return errorResponse(res, "News slug or ID is required", 400);
    }

    let newsItem = null;
    const numericId = Number(slugOrId);
    if (!Number.isNaN(numericId) && numericId > 0) {
      newsItem = await NewsService.getById(numericId);
    } else {
      newsItem = await NewsService.get(slugOrId);
    }

    if (!newsItem) {
      return errorResponse(res, "News not found", 404);
    }

    const newsFaqs = await NewsFaqService.listQuestionsByNewsId(newsItem.id);
    const responseData = {
      ...newsItem,
      news_faqs: newsFaqs,
    };

    return successResponse(res, responseData, "News fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to get news", 400);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = { ...req.body };
    const files = req.files as { author_image?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };

    if (files?.author_image?.[0]) {
      const file = files.author_image[0];
      const fileName = generateFileName(file.originalname);
      body.author_image = await uploadToS3(file.buffer, fileName, "news/authors", file.mimetype);
    }

    if (files?.thumbnail?.[0]) {
      const file = files.thumbnail[0];
      const fileName = generateFileName(file.originalname);
      body.thumbnail = await uploadToS3(file.buffer, fileName, "news/thumbnails", file.mimetype);
    }

    const newsItem = await NewsService.create(body);
    return successResponse(res, newsItem, "News created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create news", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = { ...req.body };
    const files = req.files as { author_image?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };

    if (files?.author_image?.[0]) {
      const file = files.author_image[0];
      const fileName = generateFileName(file.originalname);
      body.author_image = await uploadToS3(file.buffer, fileName, "news/authors", file.mimetype);
    } else if (body.author_image === "" || body.author_image === "null") {
      body.author_image = null;
    }

    if (files?.thumbnail?.[0]) {
      const file = files.thumbnail[0];
      const fileName = generateFileName(file.originalname);
      body.thumbnail = await uploadToS3(file.buffer, fileName, "news/thumbnails", file.mimetype);
    } else if (body.thumbnail === "" || body.thumbnail === "null") {
      body.thumbnail = null;
    }

    const updated = await NewsService.update(Number(req.params.id), body);
    if (!updated) return errorResponse(res, "News not found", 404);
    return successResponse(res, null, "News updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update news", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NewsService.delete(Number(req.params.id));
    return successResponse(res, null, "News deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const toggleVerified = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const verified = req.body.verified === true || req.body.verified === "true" || req.body.verified === 1;

    const newsItem = await NewsService.toggleVerified(id, verified);

    if (!newsItem) {
      return errorResponse(res, "News not found", 404);
    }

    return successResponse(res, newsItem, "News verification status toggled successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to toggle news verification status", 400);
  }
};
