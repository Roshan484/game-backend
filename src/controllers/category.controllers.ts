import type { Context } from "hono";
import { categorySchema } from "../validation/category.validation";
import { prisma } from "../config/database";
import { CustomError } from "../middleware/customError";

export const createCategoryController = async (c: Context) => {
	try {
		const body = await c.req.json();
		console.log("Raw body received:", body);

		const { name, description } = body;
		console.log(`Extracted name: "${name}", description: "${description}"`);

		try {
			const validatedData = categorySchema.parse({
				name,
				description,
			});
			console.log("Validation passed:", validatedData);
		} catch (validationError) {
			console.error("Validation failed:", validationError);
			return c.json(
				{ error: "Validation failed", details: validationError },
				400
			);
		}

		try {
			const category = await prisma.category.create({
				data: {
					name: name,
					description: description,
				},
			});
			console.log("Category created successfully:", category);

			return c.json(
				{
					message: "Category created successfully",
					category,
				},
				201
			);
		} catch (dbError) {
			console.error("Database error:", dbError);
			return c.json({ error: "Database operation failed" }, 500);
		}
	} catch (error) {
		console.error("Controller error:", error);
		if (error instanceof CustomError) {
			return c.json({ error: error.message }, 500);
		}
		return c.json({ error: "Failed to create category" }, 500);
	}
};

export const getAllCategoriesController = async (c: Context) => {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { createdAt: "desc" },
		});

		return c.json({ categories });
	} catch (error) {
		return c.json({ error: "Failed to fetch categories" }, 500);
	}
};

export const getCategoryByIdController = async (c: Context) => {
	try {
		const id = c.req.param("id");

		const category = await prisma.category.findUnique({
			where: { id },
			include: { questions: true },
		});

		if (!category) {
			return c.json({ error: "Category not found" }, 404);
		}

		return c.json({ category });
	} catch (error) {
		return c.json({ error: "Failed to fetch category" }, 500);
	}
};

export const updateCategoryController = async (c: Context) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const { name, description } = body;

		const validatedData = categorySchema.parse({
			name,
			description,
		});

		const category = await prisma.category.update({
			where: { id },
			data: {
				name: validatedData.name,
				description: validatedData.description,
			},
		});

		return c.json({
			message: "Category updated successfully",
			category,
		});
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Failed to update category" }, 500);
	}
};

export const deleteCategoryController = async (c: Context) => {
	try {
		const id = c.req.param("id");

		await prisma.category.delete({
			where: { id },
		});

		return c.json({
			message: "Category deleted successfully",
		});
	} catch (error) {
		return c.json({ error: "Failed to delete category" }, 500);
	}
};
