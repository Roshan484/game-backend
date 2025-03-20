import { z } from "zod";

export const createRoomSchema = z.object({
	name: z.string().min(3, "Room name must be at least 3 characters long"),
	isPrivate: z.boolean(),
	roomLimit: z
		.number()
		.min(2, "Room limit must be between 2 and 10")
		.max(10, "Room limit must be between 2 and 10")
		.optional(),
	roomCode: z
		.string()
		.min(6, "Room code must be at least 6 characters long")
		.optional(),
});

export const joinRoomSchema = z.object({
	roomCode: z.string().min(6, "Room code must be at least 6 characters long"),
});
