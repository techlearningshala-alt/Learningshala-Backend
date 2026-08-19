import { Router } from "express";
import * as CompareController from "../controllers/compare.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createCompareSetSchema,
  updateCompareSetSchema,
} from "../validators/compare.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", CompareController.getAll);
router.get("/:id", CompareController.getOne);
router.post("/", validate(createCompareSetSchema), CompareController.create);
router.put("/:id", validate(updateCompareSetSchema), CompareController.update);
router.delete("/:id", CompareController.remove);

export default router;
