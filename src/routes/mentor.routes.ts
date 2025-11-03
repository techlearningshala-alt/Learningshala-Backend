import { Router } from "express";
import * as MentorController from "../controllers/mentor.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", MentorController.getAllMentors);
router.get("/:id", MentorController.getOne);
router.post("/",upload.single("thumbnail"), MentorController.create);
router.put("/:id", upload.single("thumbnail"), MentorController.update);
router.delete("/:id", MentorController.remove);

export default router;