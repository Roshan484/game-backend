import type { Context } from "hono";

interface CustomContext extends Context {
	userId?: string;
}

export type { CustomContext };
