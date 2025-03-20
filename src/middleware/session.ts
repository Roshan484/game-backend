import { type Context, type Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";

import { redis } from "../config/redis";
import { prisma } from "../config/database";

const SESSION_TTL = 3600;

export interface SessionData {
	userId: string;
}

export const sessionMiddleware = async (c: Context, next: Next) => {
	let sessionId = getCookie(c, "session_id");
	let isNewSession = false;
	let sessionData: SessionData | null = null;

	if (sessionId) {
		const cachedSession = await redis.get(sessionId);
		if (cachedSession) {
			sessionData = JSON.parse(cachedSession);
		} else {
			const dbSession = await prisma.session.findUnique({
				where: { id: sessionId },
			});
			if (dbSession && new Date(dbSession.expiresAt) > new Date()) {
				sessionData = { userId: dbSession.userId };
				await redis.set(sessionId, JSON.stringify(sessionData), {
					EX: SESSION_TTL,
				});
			} else {
				isNewSession = true;
			}
		}
	} else {
		isNewSession = true;
	}

	if (!sessionData) sessionData = { userId: "" };
	c.set("session", sessionData);

	await next();

	if (c.get("session") !== sessionData || isNewSession) {
		if (isNewSession) {
			sessionId = crypto.randomUUID();
			setCookie(c, "session_id", sessionId, {
				httpOnly: true,
				secure: true,
				path: "/",
				sameSite: "Strict",
			});
		}
		await redis.set(sessionId ?? "", JSON.stringify(c.get("session")), {
			EX: SESSION_TTL,
		});
	}
};
