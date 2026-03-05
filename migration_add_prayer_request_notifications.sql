-- Migration: Add Prayer Request Notification Preferences
-- Run this in Supabase SQL Editor

BEGIN;

-- Add prayer request notification preference fields to NotificationPreference table
ALTER TABLE "NotificationPreference"
ADD COLUMN "emailNewPrayerRequest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "pushNewPrayerRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "inAppNewPrayerRequest" BOOLEAN NOT NULL DEFAULT true;

-- Add NEW_PRAYER_REQUEST to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_PRAYER_REQUEST';

COMMIT;
