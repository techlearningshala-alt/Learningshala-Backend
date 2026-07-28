import { Router } from "express";
import * as KycFormController from "../controllers/kyc_form.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

const kycDocUpload = upload.fields([
  { name: "doc_id", maxCount: 1 },
  { name: "doc_pan", maxCount: 1 },
  { name: "doc_shop_addr", maxCount: 1 },
  { name: "doc_cheque", maxCount: 1 },
  { name: "doc_photo_out", maxCount: 1 },
  { name: "doc_photo_in", maxCount: 1 },
]);

// Public create (multipart form-data + files)
router.post("/", kycDocUpload, KycFormController.create);

// Admin list / detail
router.get("/", authMiddleware, KycFormController.getAll);
router.get("/:id", authMiddleware, KycFormController.getOne);

export default router;
