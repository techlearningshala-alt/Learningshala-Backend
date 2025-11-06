import { Router } from "express";
import * as DomainController from "../../controllers/courses/domain.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createDomainSchema } from "../../validators/courses/domain.validator";
import { upload } from "../../config/multer";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", DomainController.getAll);
router.get("/:id", DomainController.getById);
router.post("/", upload.single("thumbnail"), DomainController.create);
router.put("/:id", upload.single("thumbnail"), DomainController.update);
router.delete("/:id", DomainController.remove);

export default router;
