/*
  Warnings:

  - You are about to drop the column `aboutMe` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "aboutMe";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aboutMe" TEXT,
ADD COLUMN     "telegramLink" TEXT,
ADD COLUMN     "vkLink" TEXT;
