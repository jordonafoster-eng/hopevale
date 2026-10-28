-- Migration: Make music playlists and kids corner assets group-specific
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Add groupId columns
-- ============================================
ALTER TABLE "Playlist" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
ALTER TABLE "KidsAsset" ADD COLUMN IF NOT EXISTS "groupId" TEXT;

CREATE INDEX IF NOT EXISTS "Playlist_groupId_idx" ON "Playlist"("groupId");
CREATE INDEX IF NOT EXISTS "KidsAsset_groupId_idx" ON "KidsAsset"("groupId");

DO $$ BEGIN
  ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "KidsAsset" ADD CONSTRAINT "KidsAsset_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- STEP 2: Assign existing content to the original group
-- ============================================
UPDATE "Playlist" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;
UPDATE "KidsAsset" SET "groupId" = 'default-group-id' WHERE "groupId" IS NULL;
