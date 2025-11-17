import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as FeeTypeController from "../../controllers/universities/fee_type.controller";
import {
  createFeeTypeSchema,
  updateFeeTypeSchema,
} from "../../validators/universities/fee_type.validator";

const router = express.Router();

router.use(authMiddleware);

router.get("/", FeeTypeController.findAll);
router.get("/:id", FeeTypeController.findOne);
router.post("/", validate(createFeeTypeSchema), FeeTypeController.create);
router.put("/:id", validate(updateFeeTypeSchema), FeeTypeController.update);
router.delete("/:id", FeeTypeController.remove);

export default router;


