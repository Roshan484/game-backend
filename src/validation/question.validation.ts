import { z } from "zod";

export const questionSchema = z.object({
	content: z.string().min(1, "Question content is required"),
	categoryId: z.string().uuid("Invalid category ID"),
});
