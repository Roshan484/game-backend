/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomCode` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `RoomUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdBy` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_userId_fkey";

-- DropIndex
DROP INDEX "Room_roomCode_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "expiresAt",
DROP COLUMN "roomCode",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ALTER COLUMN "isPrivate" DROP DEFAULT,
ALTER COLUMN "roomLimit" DROP NOT NULL,
ALTER COLUMN "roomLimit" DROP DEFAULT;

-- DropTable
DROP TABLE "RoomUser";

-- CreateTable
CREATE TABLE "RoomParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "RoomCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomCode_code_key" ON "RoomCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RoomCode_roomId_key" ON "RoomCode"("roomId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomCode" ADD CONSTRAINT "RoomCode_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
