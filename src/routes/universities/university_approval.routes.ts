import { Router } from "express";
import * as UniversityApprovalController from "../../controllers/universities/university_approval.controller";
import { upload } from "../../config/multer";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// List all university approvals with pagination
router.get("/",  UniversityApprovalController.getAllUniversityApprovals);

//List approvals
router.get("/name",  UniversityApprovalController.getApprovals);

// Get single university approval by ID
router.get("/:id" , UniversityApprovalController.getUniversityApprovalById);

// Create new university approval (optional logo upload)
router.post("/" , upload.single("logo"), UniversityApprovalController.createUniversityApproval);

// Update university approval by ID
router.put("/:id",  upload.single("logo"), UniversityApprovalController.updateUniversityApproval);

// Delete university approval by ID
router.delete("/:id" , UniversityApprovalController.deleteUniversityApproval);

export default router;
