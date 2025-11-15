-- Migration: Add Device Tokens and Push Tracking
-- Run this in Supabase SQL Editor

BEGIN;

-- Add push tracking fields to Notification table
ALTER TABLE "Notification"
ADD COLUMN "pushSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pushSentAt" TIMESTAMP(3);

-- Create DeviceToken table
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- Create unique index on token
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- Create indexes for performance
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");
CREATE INDEX "DeviceToken_token_idx" ON "DeviceToken"("token");

-- Add foreign key constraint
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
