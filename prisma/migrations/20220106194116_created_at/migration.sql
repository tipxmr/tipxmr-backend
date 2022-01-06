/*
  Warnings:

  - You are about to drop the column `is_online` on the `Streamer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Streamer" DROP COLUMN "is_online",
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false;
