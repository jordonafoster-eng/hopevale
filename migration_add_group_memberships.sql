-- Migration: Allow users to belong to multiple groups
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Create GroupMembership table
-- ============================================
CREATE TABLE IF NOT EXISTS "GroupMembership" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroupMembership_userId_groupId_key" ON "GroupMembership"("userId", "groupId");
CREATE INDEX IF NOT EXISTS "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- ============================================
-- STEP 2: Backfill memberships from each user's current group
-- ============================================
-- SUPER_ADMINs get GROUP_ADMIN in their home group; everyone else keeps their role.
INSERT INTO "GroupMembership" ("id", "userId", "groupId", "role", "createdAt")
SELECT
  'gm_' || md5(random()::text || u."id"),
  u."id",
  u."groupId",
  CASE WHEN u."role" = 'SUPER_ADMIN' THEN 'GROUP_ADMIN'::"Role" ELSE u."role" END,
  u."createdAt"
FROM "User" u
WHERE u."groupId" IS NOT NULL
ON CONFLICT ("userId", "groupId") DO NOTHING;

-- ============================================
-- STEP 3: Row Level Security (matches other tables)
-- ============================================
ALTER TABLE "GroupMembership" ENABLE ROW LEVEL SECURITY;
