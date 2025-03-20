import { type Context } from "hono";

import { getCookie, setCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import { CustomError } from "../middleware/customError";
import { redis } from "../config/redis";
import { prisma } from "../config/database";

export const register = async (c: Context) => {
	try {
		const body = await c.req.json();
		const validatedData = registerSchema.parse(body);

		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
		});
		if (existingUser) throw new CustomError("Email already exists", 400);

		const hashedPassword = await bcrypt.hash(validatedData.password, 10);

		const user = await prisma.user.create({
			data: { ...validatedData, password: hashedPassword },
		});

		return c.json({
			success: true,
			message: "User registered successfully",
			data: {
				user: user,
			},
		});
	} catch (error) {
		if (error instanceof ZodError) {
			throw new CustomError(
				error.errors[0]?.message || "Invalid input data",
				400
			);
		}
		if (error instanceof CustomError) {
			throw error;
		}
		throw new CustomError("Something went wrong", 500);
	}
};

export const login = async (c: Context) => {
	try {
		const body = await c.req.json();
		const validatedData = loginSchema.parse(body);

		const user = await prisma.user.findUnique({
			where: { email: validatedData.email },
		});
		if (!user) throw new CustomError("Invalid email or password", 401);

		const isValid = await bcrypt.compare(validatedData.password, user.password);
		if (!isValid) throw new CustomError("Invalid email or password", 401);

		const existingSession = await prisma.session.findUnique({
			where: { userId: user.id },
		});

		if (existingSession) {
			await prisma.session.delete({
				where: { id: existingSession.id },
			});
		}
		const session = await prisma.session.create({
			data: {
				userId: user.id,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60),
			},
		});

		await redis.set(session.id, JSON.stringify({ userId: user.id }), {
			EX: 3600,
		});

		setCookie(c, "session_id", session.id, {
			httpOnly: true,
			secure: true,
			path: "/",
			sameSite: "Strict",
		});

		return c.json({
			success: true,
			message: "Login successful",
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				gender: user.gender,
				country: user.country,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		if (error instanceof ZodError) {
			throw new CustomError(
				error.errors[0]?.message || "Invalid input data",
				400
			);
		}
		if (error instanceof CustomError) {
			throw error;
		}
		throw new CustomError("Something went wrong", 500);
	}
};

export const logout = async (c: Context) => {
	try {
		const sessionId = getCookie(c, "session_id");

		if (!sessionId) throw new CustomError("No active session", 401);

		await prisma.session.deleteMany({ where: { id: sessionId } });
		await redis.del(sessionId);

		setCookie(c, "session_id", "", { maxAge: 0, path: "/" });

		return c.json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw new CustomError("Something went wrong", 500);
	}
};

export const getUser = async (c: Context) => {
	try {
		const userId = c.get("userId");

		if (!userId) {
			throw new CustomError(
				"Unauthorized: No userId found in the session",
				401
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				gender: true,
				country: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			throw new CustomError("User not found", 404);
		}

		return c.json({ success: true, user });
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw new CustomError("Something went wrong", 500);
	}
};
