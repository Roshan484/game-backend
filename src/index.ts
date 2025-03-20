import app from "./app";

Bun.serve({
	port: process.env.PORT || 5001,
	fetch: app.fetch,
});
