/*
  Warnings:

  - Added the required column `updatedAt` to the `OpportunityResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpportunityResponse" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records
UPDATE "OpportunityResponse" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
