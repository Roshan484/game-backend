import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import {
	createRoomController,
	generateRoomCodeController,
	joinRoomController,
} from "../controllers/room.controllers";

const roomRoutes = new Hono();

roomRoutes.use("*", authMiddleware);

roomRoutes.post("/create", createRoomController);
roomRoutes.post("/generate-code", generateRoomCodeController);
roomRoutes.post("/join", joinRoomController);

export default roomRoutes;
