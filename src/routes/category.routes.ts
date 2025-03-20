import { Hono } from "hono";

import {
	createCategoryController,
	getAllCategoriesController,
	getCategoryByIdController,
	updateCategoryController,
	deleteCategoryController,
} from "../controllers/category.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const categoryRoutes = new Hono();

categoryRoutes.get("/", getAllCategoriesController);
categoryRoutes.get("/:id", getCategoryByIdController);

categoryRoutes.use("/admin/*", authMiddleware);
categoryRoutes.use("/admin/*", adminMiddleware);

categoryRoutes.post("/admin/create", createCategoryController);
categoryRoutes.put("/admin/update/:id", updateCategoryController);
categoryRoutes.delete("/admin/delete/:id", deleteCategoryController);

export default categoryRoutes;
