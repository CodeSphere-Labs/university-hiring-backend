-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('WAITING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "OpportunityResponse" ADD COLUMN     "status" "ResponseStatus" NOT NULL DEFAULT 'WAITING';
