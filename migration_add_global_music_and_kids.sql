-- Migration: Let SUPER_ADMINs share music playlists and kids corner assets with all groups
-- Shared items are locked: only SUPER_ADMINs can edit or delete them
-- Run this in Supabase SQL Editor

ALTER TABLE "Playlist" ADD COLUMN IF NOT EXISTS "isGlobal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "KidsAsset" ADD COLUMN IF NOT EXISTS "isGlobal" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Playlist_isGlobal_idx" ON "Playlist"("isGlobal");
CREATE INDEX IF NOT EXISTS "KidsAsset_isGlobal_idx" ON "KidsAsset"("isGlobal");
