import { Router } from "express";
import * as DomainController from "../../controllers/courses/domain.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createDomainSchema } from "../../validators/courses/domain.validator";
import { upload } from "../../config/multer";

const router = Router();

router.get("/", DomainController.getAll);
router.get("/:id", DomainController.getById);
router.post("/", upload.single("thumbnail"), DomainController.create);
router.put("/:id", upload.single("thumbnail"), DomainController.update);
router.delete("/:id", DomainController.remove);

export default router;
