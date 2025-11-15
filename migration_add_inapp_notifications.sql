-- Migration: Add In-App Notification Preferences
-- Run this in Supabase SQL Editor

BEGIN;

-- Add in-app notification preference fields to NotificationPreference table
ALTER TABLE "NotificationPreference"
ADD COLUMN "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "inAppNewEvent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "inAppEventReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "inAppRsvpConfirmation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "inAppPrayerReaction" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "inAppNewReflection" BOOLEAN NOT NULL DEFAULT true;

COMMIT;
