import { Hono } from "hono";
import { logger } from "hono/logger";
import { sessionMiddleware } from "./middleware/session";
import roomRoutes from "./routes/room.routes";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import questionRoutes from "./routes/questions.routes";
import { cors } from "hono/cors";

const app = new Hono();

app.use(logger());

app.use(
	"*",
	cors({
		credentials: true,
		origin: ["http://localhost:3000", "http://localhost:3001"],
	})
);

app.use(sessionMiddleware);

app.route("/api/auth", authRoutes);
app.route("/api/room", roomRoutes);
app.route("/api/categories", categoryRoutes);
app.route("/api/questions", questionRoutes);

app.get("/", (c) => {
	return c.text("Hello, World!");
});
export default app;
