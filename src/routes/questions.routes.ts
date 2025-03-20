import { Hono } from "hono";

import {
	createQuestionController,
	getQuestionsByCategoryController,
	getQuestionByIdController,
	updateQuestionController,
	deleteQuestionController,
	getRandomQuestionsController,
} from "../controllers/question.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const questionRoutes = new Hono();

questionRoutes.get("/category/:categoryId", getQuestionsByCategoryController);
questionRoutes.get("/:id", getQuestionByIdController);
questionRoutes.get("/random/:categoryId/:limit", getRandomQuestionsController);

questionRoutes.use("/admin/*", authMiddleware);
questionRoutes.use("/admin/*", adminMiddleware);

questionRoutes.post("/admin/create", createQuestionController);
questionRoutes.put("/admin/update/:id", updateQuestionController);
questionRoutes.delete("/admin/delete/:id", deleteQuestionController);

export default questionRoutes;
