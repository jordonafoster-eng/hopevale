-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");
