-- Create or update admin user
-- Run this directly in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- Step 1: Create UserStatus enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
        CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');
    END IF;
END $$;

-- Step 2: Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'status'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
        CREATE INDEX "User_status_idx" ON "User"("status");
    END IF;
END $$;

-- Step 3: Rename youtubePlaylistId to youtubeUrl in Playlist table if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Playlist' AND column_name = 'youtubePlaylistId'
    ) THEN
        ALTER TABLE "Playlist" RENAME COLUMN "youtubePlaylistId" TO "youtubeUrl";
    END IF;
END $$;

-- Step 4: Delete existing user if any (to start fresh)
DELETE FROM "User" WHERE email = 'jordonafoster@gmail.com';

-- Step 5: Create the admin user with hashed password
-- Email: jordonafoster@gmail.com
-- Password: wohxaB-dangyq-xuxxy0
INSERT INTO "User" (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Jordon Foster',
  'jordonafoster@gmail.com',
  '$2a$12$bSLR4nfs/reuNnFJEvAxaetNmV9Dd2vzXPb6yKXWnhIRaPcpH/DcC',
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
);

-- Step 6: Verify the user was created
SELECT id, name, email, role, status, "createdAt"
FROM "User"
WHERE email = 'jordonafoster@gmail.com';
