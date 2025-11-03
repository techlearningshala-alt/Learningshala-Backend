import express from "express";
import * as EmiPartnerController from "../../controllers/universities/emi-partner.controller";
import { upload } from "../../config/multer";

const router = express.Router();

// Create new EMI partner
router.post(
  "/",
  upload.single("logo"), // Single logo upload
  EmiPartnerController.create
);

// Update EMI partner
router.put(
  "/:id",
  upload.single("logo"), // Single logo upload
  EmiPartnerController.update
);

// Get all EMI partners
router.get("/", EmiPartnerController.findAll);

// Get single EMI partner
router.get("/:id", EmiPartnerController.findOne);

// Delete EMI partner
router.delete("/:id", EmiPartnerController.remove);

export default router;

