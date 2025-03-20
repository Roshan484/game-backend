import type { Context } from "hono";
import { questionSchema } from "../validation/question.validation";
import { prisma } from "../config/database";
import { CustomError } from "../middleware/customError";

export const createQuestionController = async (c: Context) => {
	try {
		const body = await c.req.json();
		const { content, categoryId } = body;

		const validatedData = questionSchema.parse({
			content,
			categoryId,
		});

		const categoryExists = await prisma.category.findUnique({
			where: { id: validatedData.categoryId },
		});

		if (!categoryExists) {
			return c.json({ error: "Category not found" }, 404);
		}

		const question = await prisma.question.create({
			data: {
				content: validatedData.content,
				categoryId: validatedData.categoryId,
			},
		});

		return c.json(
			{
				message: "Question created successfully",
				question,
			},
			201
		);
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Failed to create question" }, 500);
	}
};

export const getQuestionsByCategoryController = async (c: Context) => {
	try {
		const categoryId = c.req.param("categoryId");

		const questions = await prisma.question.findMany({
			where: { categoryId },
			orderBy: { createdAt: "desc" },
		});

		return c.json({ questions });
	} catch (error) {
		return c.json({ error: "Failed to fetch questions" }, 500);
	}
};

export const getQuestionByIdController = async (c: Context) => {
	try {
		const id = c.req.param("id");

		const question = await prisma.question.findUnique({
			where: { id },
		});

		if (!question) {
			return c.json({ error: "Question not found" }, 404);
		}

		return c.json({ question });
	} catch (error) {
		return c.json({ error: "Failed to fetch question" }, 500);
	}
};

export const updateQuestionController = async (c: Context) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const { content, categoryId } = body;

		const validatedData = questionSchema.parse({
			content,
			categoryId,
		});

		const categoryExists = await prisma.category.findUnique({
			where: { id: validatedData.categoryId },
		});

		if (!categoryExists) {
			return c.json({ error: "Category not found" }, 404);
		}

		const question = await prisma.question.update({
			where: { id },
			data: {
				content: validatedData.content,
				categoryId: validatedData.categoryId,
			},
		});

		return c.json({
			message: "Question updated successfully",
			question,
		});
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Failed to update question" }, 500);
	}
};

export const deleteQuestionController = async (c: Context) => {
	try {
		const id = c.req.param("id");

		await prisma.question.delete({
			where: { id },
		});

		return c.json({
			message: "Question deleted successfully",
		});
	} catch (error) {
		return c.json({ error: "Failed to delete question" }, 500);
	}
};

export const getRandomQuestionsController = async (c: Context) => {
	try {
		const categoryId = c.req.param("categoryId");
		const limit = parseInt(c.req.param("limit")) || 10;

		const allQuestions = await prisma.question.findMany({
			where: { categoryId },
		});

		const randomQuestions = allQuestions
			.sort(() => 0.5 - Math.random())
			.slice(0, limit);

		return c.json({ questions: randomQuestions });
	} catch (error) {
		return c.json({ error: "Failed to fetch random questions" }, 500);
	}
};
