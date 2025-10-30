-- Create or update admin user
-- Run this directly in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- First, delete the user if they exist (to start fresh)
DELETE FROM "User" WHERE email = 'jordonafoster@gmail.com';

-- Create the admin user with hashed password
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

-- Verify the user was created
SELECT id, name, email, role, status, "createdAt"
FROM "User"
WHERE email = 'jordonafoster@gmail.com';
