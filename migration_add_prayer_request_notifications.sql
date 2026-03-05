-- Migration: Add Prayer Request Notification Preferences
-- Run this in Supabase SQL Editor

-- Add NEW_PRAYER_REQUEST to NotificationType enum
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'NEW_PRAYER_REQUEST';

-- Add prayer request notification preference fields to NotificationPreference table
ALTER TABLE "NotificationPreference"
ADD COLUMN IF NOT EXISTS "emailNewPrayerRequest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "pushNewPrayerRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "inAppNewPrayerRequest" BOOLEAN NOT NULL DEFAULT true;
