import { Router } from "express";
import * as HomeTitleDescriptionController from "../controllers/home_title_description.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createHomeTitleDescriptionSchema,
  updateHomeTitleDescriptionSchema,
} from "../validators/home_title_description.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", HomeTitleDescriptionController.getAll);
router.get("/:id", HomeTitleDescriptionController.getOne);
router.post(
  "/",
  validate(createHomeTitleDescriptionSchema),
  HomeTitleDescriptionController.create
);
router.put(
  "/:id",
  validate(updateHomeTitleDescriptionSchema),
  HomeTitleDescriptionController.update
);
router.delete("/:id", HomeTitleDescriptionController.remove);

export default router;
