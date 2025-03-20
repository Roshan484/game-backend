import type { Context } from "hono";
import { CustomError } from "../middleware/customError";
import { createRoomSchema } from "../validation/room.validation";
import { prisma } from "../config/database";
import { nanoid } from "nanoid";

export const createRoomController = async (c: Context) => {
	try {
		const body = await c.req.json();
		const { name, isPrivate, roomLimit, roomCode } = body;

		const userId = c.get("userId");
		if (!userId) {
			throw new CustomError("Unauthorized: User ID not found", 401);
		}

		const validatedData = createRoomSchema.parse({
			name,
			isPrivate,
			roomLimit,
			roomCode,
		});

		const room = await prisma.room.create({
			data: {
				name: validatedData.name,
				isPrivate: validatedData.isPrivate,
				roomLimit: validatedData.roomLimit,
				createdBy: userId,
				User: {
					connect: { id: userId },
				},
			},
		});

		await prisma.roomParticipant.create({
			data: {
				userId,
				roomId: room.id,
			},
		});

		let generatedRoomCode;

		if (room.isPrivate) {
			const codeToUse = roomCode || nanoid(6);

			await prisma.roomCode.create({
				data: {
					code: codeToUse,
					expiresAt: new Date(Date.now() + 10 * 60 * 1000),
					roomId: room.id,
				},
			});

			generatedRoomCode = codeToUse;
		}

		return c.json(
			{
				message: `Room created successfully!`,
				roomId: room.id,
				roomCode: generatedRoomCode,
			},
			201
		);
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Failed to create room" }, 500);
	}
};

export const joinRoomController = async (c: Context) => {
	try {
		const body = await c.req.json();
		const { roomCode } = body;

		const userId = c.get("userId");
		if (!userId) {
			throw new CustomError("Unauthorized: User ID not found", 401);
		}

		const roomCodeRecord = await prisma.roomCode.findUnique({
			where: { code: roomCode },
			include: { room: true },
		});

		if (!roomCodeRecord) {
			throw new CustomError("Invalid or expired room code.", 400);
		}

		if (roomCodeRecord.expiresAt < new Date()) {
			await prisma.roomCode.delete({
				where: { id: roomCodeRecord.id },
			});
			throw new CustomError("Room code has expired.", 400);
		}

		const room = roomCodeRecord.room;

		const existingParticipant = await prisma.roomParticipant.findFirst({
			where: {
				userId,
				roomId: room.id,
			},
		});

		if (existingParticipant) {
			throw new CustomError("You are already a participant in this room.", 400);
		}

		if (room.roomLimit) {
			const currentParticipantCount = await prisma.roomParticipant.count({
				where: { roomId: room.id },
			});

			if (currentParticipantCount >= room.roomLimit) {
				throw new CustomError(
					"The room has reached its participant limit.",
					400
				);
			}
		}

		await prisma.roomParticipant.create({
			data: {
				userId,
				roomId: room.id,
			},
		});

		await prisma.room.update({
			where: { id: room.id },
			data: {
				User: {
					connect: { id: userId },
				},
			},
		});

		return c.json({
			message: `Successfully joined the room: ${room.name}`,
		});
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Failed to join room" }, 500);
	}
};

export const generateRoomCodeController = async (c: Context) => {
	try {
		const body = await c.req.json();
		const { roomId, roomLimit } = body;

		const userId = c.get("userId");
		if (!userId) {
			throw new CustomError("Unauthorized: User ID not found", 401);
		}

		if (roomLimit !== undefined && (roomLimit < 2 || roomLimit > 10)) {
			throw new CustomError(
				"Room limit should be between 2 and 10 for private rooms.",
				400
			);
		}

		const room = await prisma.room.findUnique({
			where: { id: roomId },
		});

		if (!room) {
			throw new CustomError("Room not found.", 404);
		}

		if (room.createdBy !== userId) {
			throw new CustomError("Only the room creator can generate a code.", 403);
		}

		const existingCode = await prisma.roomCode.findUnique({
			where: { roomId },
		});

		if (existingCode) {
			if (existingCode.expiresAt < new Date()) {
				await prisma.roomCode.delete({
					where: { id: existingCode.id },
				});
			} else {
				return c.json({
					roomCode: existingCode.code,
					expiresAt: existingCode.expiresAt,
				});
			}
		}

		const roomCode = nanoid(6);
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		await prisma.roomCode.create({
			data: {
				roomId,
				code: roomCode,
				expiresAt,
			},
		});

		return c.json({ roomCode, expiresAt });
	} catch (error) {
		if (error instanceof CustomError) {
			return c.json({ error: error.message });
		}
		return c.json({ error: "Failed to generate room code" }, 500);
	}
};
