import express from "express";
import * as PlacementPartnerController from "../../controllers/universities/placement-partner.controller";
import { upload } from "../../config/multer";

const router = express.Router();

// Create placement partner with logo upload
router.post(
  "/",
  upload.single("logo"),
  PlacementPartnerController.create
);

// Update placement partner with logo upload
router.put(
  "/:id",
  upload.single("logo"),
  PlacementPartnerController.update
);

// Get all placement partners
router.get("/", PlacementPartnerController.findAll);

// Get single placement partner
router.get("/:id", PlacementPartnerController.findOne);

// Delete placement partner
router.delete("/:id", PlacementPartnerController.remove);

export default router;

