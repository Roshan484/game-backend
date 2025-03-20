import type { Context, Next } from "hono";

import { CustomError } from "./customError";
import { prisma } from "../config/database";

export const adminMiddleware = async (c: Context, next: Next) => {
	try {
		const userId = c.get("userId");

		if (!userId) {
			return c.json({ error: "Unauthorized: User not authenticated" }, 401);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!user || user.role !== "ADMIN") {
			return c.json({ error: "Forbidden: Admin access required" }, 403);
		}

		await next();
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Something went wrong" }, 500);
	}
};
