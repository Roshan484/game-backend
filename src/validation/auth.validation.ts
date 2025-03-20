import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	username: z.string().min(3, "Username must be at least 3 characters"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]),
	country: z.string().min(2, "Invalid country name"),
});

export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
