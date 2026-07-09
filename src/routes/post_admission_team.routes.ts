import { Router } from "express";
import * as PostAdmissionTeamController from "../controllers/post_admission_team.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", PostAdmissionTeamController.getAll);
router.get("/:id", PostAdmissionTeamController.getOne);
router.post("/", upload.single("thumbnail"), PostAdmissionTeamController.create);
router.put("/:id", upload.single("thumbnail"), PostAdmissionTeamController.update);
router.delete("/:id", PostAdmissionTeamController.remove);

export default router;
