import { Router } from "express";
import * as UploadController from "../../controllers/upload/upload.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

router.use(authMiddleware);

router.get("/", UploadController.getAll);
router.get("/:id", UploadController.getOne);
router.post("/", upload.any(), UploadController.create);
router.put("/:id", upload.any(), UploadController.update);
router.delete("/:id", UploadController.remove);

export default router;
