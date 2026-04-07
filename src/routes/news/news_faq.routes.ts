import { Router } from "express";
import * as NewsFaqController from "../../controllers/news/news_faq.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createNewsFaqQuestionSchema, updateNewsFaqQuestionSchema } from "../../validators/news/news_faq.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", NewsFaqController.listAdminQuestions);
router.get("/questions", NewsFaqController.listAllQuestions);
router.get("/news/:newsId/questions", NewsFaqController.listQuestionsByNewsId);
router.get("/questions/:id", NewsFaqController.getQuestion);
router.post("/questions", validate(createNewsFaqQuestionSchema), NewsFaqController.createQuestion);
router.put("/questions/:id", validate(updateNewsFaqQuestionSchema), NewsFaqController.updateQuestion);
router.delete("/questions/:id", NewsFaqController.deleteQuestion);

export default router;
