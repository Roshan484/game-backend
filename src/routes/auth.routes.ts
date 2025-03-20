import { Hono } from "hono";
import {
	getUser,
	login,
	logout,
	register,
} from "../controllers/auth.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { errorHandler } from "../middleware/customError";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/logout", logout);
authRoutes.get("/me", authMiddleware, getUser);

authRoutes.onError(errorHandler);

export default authRoutes;
