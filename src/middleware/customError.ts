import { type Context } from "hono";

export class CustomError extends Error {
	status: number;

	constructor(message: string, status: number = 400) {
		super(message);
		this.status = status;
	}
}

export const errorHandler = (err: any, c: Context) => {
	const status = err.status || 500;
	return c.json({ success: false, message: err.message }, status);
};
