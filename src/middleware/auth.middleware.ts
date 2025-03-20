import { getCookie, setCookie } from "hono/cookie";
import { redis } from "../config/redis";
import { CustomError } from "./customError";
import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	try {
		const sessionId = getCookie(c, "session_id");

		if (!sessionId) {
			throw new CustomError("Unauthorized: No session cookie found", 401);
		}

		const sessionData = await redis.get(sessionId);

		if (!sessionData) {
			setCookie(c, "session_id", "", { maxAge: 0, path: "/" });
			throw new CustomError("Unauthorized: Invalid or expired session", 401);
		}

		const parsedSession = JSON.parse(sessionData);
		const { userId } = parsedSession;

		c.set("userId", userId);

		await next();
	} catch (err) {
		throw new CustomError("Something went wrong", 500);
	}
};
