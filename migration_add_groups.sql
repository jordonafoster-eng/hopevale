-- Migration: Add Multi-Tenant Group System
-- Run this in Supabase SQL Editor
-- IMPORTANT: Run each section separately if you encounter issues

-- ============================================
-- STEP 1: Update Role enum
-- ============================================
-- Note: In PostgreSQL, you cannot rename enum values directly
-- We need to add new values and update existing data

-- Add new enum values (cannot be in transaction)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GROUP_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- ============================================
-- STEP 2: Create Group table
-- ============================================
CREATE TABLE IF NOT EXISTS "Group" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Group_slug_key" ON "Group"("slug");
CREATE INDEX IF NOT EXISTS "Group_slug_idx" ON "Group"("slug");
CREATE INDEX IF NOT EXISTS "Group_deletedAt_idx" ON "Group"("deletedAt");

-- ============================================
-- STEP 3: Create GroupInvite table
-- ============================================
CREATE TABLE IF NOT EXISTS "GroupInvite" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "email" TEXT,
  "token" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupInvite_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupInvite_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroupInvite_token_key" ON "GroupInvite"("token");
CREATE INDEX IF NOT EXISTS "GroupInvite_token_idx" ON "GroupInvite"("token");
CREATE INDEX IF NOT EXISTS "GroupInvite_email_idx" ON "GroupInvite"("email");
CREATE INDEX IF NOT EXISTS "GroupInvite_groupId_idx" ON "GroupInvite"("groupId");

-- ============================================
-- STEP 4: Add groupId columns to tables
-- ============================================

-- Add groupId to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
CREATE INDEX IF NOT EXISTS "User_groupId_idx" ON "User"("groupId");
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add groupId to Prayer
ALTER TABLE "Prayer" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
CREATE INDEX IF NOT EXISTS "Prayer_groupId_idx" ON "Prayer"("groupId");
ALTER TABLE "Prayer" ADD CONSTRAINT "Prayer_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add groupId to Reflection
ALTER TABLE "Reflection" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
CREATE INDEX IF NOT EXISTS "Reflection_groupId_idx" ON "Reflection"("groupId");
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add groupId to Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
CREATE INDEX IF NOT EXISTS "Event_groupId_idx" ON "Event"("groupId");
ALTER TABLE "Event" ADD CONSTRAINT "Event_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add groupId to Recipe
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
CREATE INDEX IF NOT EXISTS "Recipe_groupId_idx" ON "Recipe"("groupId");
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- STEP 5: Create default group and migrate data
-- ============================================

-- Create default group for existing data
INSERT INTO "Group" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('default-group-id', 'Hope Vale Community', 'hope-vale-community', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Update all existing users to belong to default group
UPDATE "User" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;

-- Update all existing content to belong to default group
UPDATE "Prayer" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;
UPDATE "Reflection" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;
UPDATE "Event" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;
UPDATE "Recipe" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;

-- ============================================
-- STEP 6: Update roles (ADMIN -> SUPER_ADMIN for first admin, GROUP_ADMIN for others)
-- ============================================

-- First, find and update the first ADMIN to SUPER_ADMIN
UPDATE "User"
SET "role" = 'SUPER_ADMIN'
WHERE "id" = (
  SELECT "id" FROM "User"
  WHERE "role" = 'ADMIN'
  ORDER BY "createdAt" ASC
  LIMIT 1
);

-- Then update remaining ADMINs to GROUP_ADMIN
UPDATE "User"
SET "role" = 'GROUP_ADMIN'
WHERE "role" = 'ADMIN';

-- ============================================
-- VERIFICATION: Check the migration results
-- ============================================
-- Run these queries to verify:

-- SELECT COUNT(*) as total_users, "groupId" FROM "User" GROUP BY "groupId";
-- SELECT COUNT(*) as total_prayers, "groupId" FROM "Prayer" GROUP BY "groupId";
-- SELECT "name", "email", "role", "groupId" FROM "User" WHERE "role" IN ('SUPER_ADMIN', 'GROUP_ADMIN');
-- SELECT "id", "name", "slug" FROM "Group";
