/*
  Warnings:

  - Added the required column `organizationId` to the `Practice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "universityId" INTEGER;

-- AlterTable
ALTER TABLE "Practice" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
