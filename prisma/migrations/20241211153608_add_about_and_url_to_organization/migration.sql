/*
  Warnings:

  - Added the required column `about` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteUrl` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "websiteUrl" TEXT NOT NULL;
