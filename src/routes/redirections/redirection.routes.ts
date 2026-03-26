import { Router } from "express";
import * as RedirectionController from "../../controllers/redirections/redirection.controller";

const router = Router();

router.get("/", RedirectionController.getAll);
// Must be before /:id so "resolve" is not parsed as an id
router.get("/resolve", RedirectionController.resolvePublic);
router.get("/:id", RedirectionController.getOne);
router.post("/", RedirectionController.create);
router.put("/:id", RedirectionController.update);
router.delete("/:id", RedirectionController.remove);

export default router;
