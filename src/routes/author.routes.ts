import { Router } from "express";
import * as AuthorController from "../controllers/author.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", AuthorController.getAll);
router.get("/:id", AuthorController.getOne);
router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  AuthorController.create
);
router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  AuthorController.update
);
router.delete("/:id", AuthorController.remove);

export default router;
