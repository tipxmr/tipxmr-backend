/*
  Warnings:

  - You are about to drop the column `creation_date` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "creation_date",
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false;
