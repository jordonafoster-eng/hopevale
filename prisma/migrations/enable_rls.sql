-- Enable Row Level Security on all tables
-- Run this in Supabase SQL Editor
--
-- SECURITY MODEL: Only registered users in the User table can access data
-- This is a private community app, not for public consumption

-- ==================== SYSTEM TABLES ====================

-- Enable RLS on Prisma migrations table (no policies = blocks PostgREST access)
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- ==================== AUTH & USERS ====================

-- User table: Users can read all community members, update own data, admins manage all
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read all users" ON "User"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND status = 'ACTIVE'));

CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Admins can manage all users" ON "User"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  ));

-- Account table: Users can only access their own accounts
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts" ON "Account"
  FOR ALL
  USING (auth.uid()::text = "userId");

-- Session table: Users can only access their own sessions
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON "Session"
  FOR ALL
  USING (auth.uid()::text = "userId");

-- VerificationToken: Read-only for registered users
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read verification tokens" ON "VerificationToken"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

-- ==================== EVENTS ====================

-- Event table: Registered users can read published events, create events, manage own
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read published events" ON "Event"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         ("isPublished" = true OR auth.uid()::text = "createdById" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

CREATE POLICY "Registered users can create events" ON "Event"
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "createdById");

CREATE POLICY "Users can update own events or admins all" ON "Event"
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "createdById" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )))
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              (auth.uid()::text = "createdById" OR EXISTS (
                SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
              )));

CREATE POLICY "Users can delete own events or admins all" ON "Event"
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "createdById" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

-- RSVP table: Registered users can read all RSVPs, manage their own
ALTER TABLE "RSVP" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read RSVPs" ON "RSVP"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Users can manage own RSVPs" ON "RSVP"
  FOR ALL
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- ==================== PRAYER WALL ====================

-- Prayer table: Registered users can read approved prayers, manage own, admins manage all
ALTER TABLE "Prayer" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read approved prayers" ON "Prayer"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         ("isApproved" = true AND "deletedAt" IS NULL OR
          auth.uid()::text = "authorId" OR
          EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN')));

CREATE POLICY "Registered users can create prayers" ON "Prayer"
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              (auth.uid()::text = "authorId" OR "isAnonymous" = true));

CREATE POLICY "Users can update own prayers or admins all" ON "Prayer"
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )))
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              (auth.uid()::text = "authorId" OR EXISTS (
                SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
              )));

CREATE POLICY "Users can delete own prayers or admins all" ON "Prayer"
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

-- ==================== REFLECTIONS ====================

-- Reflection table: Registered users can read approved, manage own, admins manage all
ALTER TABLE "Reflection" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read approved reflections" ON "Reflection"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         ("isApproved" = true AND "deletedAt" IS NULL OR
          auth.uid()::text = "authorId" OR
          EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN')));

CREATE POLICY "Registered users can create reflections" ON "Reflection"
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "authorId");

CREATE POLICY "Users can update own reflections or admins all" ON "Reflection"
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )))
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              (auth.uid()::text = "authorId" OR EXISTS (
                SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
              )));

CREATE POLICY "Users can delete own reflections or admins all" ON "Reflection"
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

-- ==================== RECIPES ====================

-- Recipe table: Registered users can read all, create, manage own
ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read recipes" ON "Recipe"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Registered users can create recipes" ON "Recipe"
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "authorId");

CREATE POLICY "Users can update own recipes or admins all" ON "Recipe"
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )))
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              (auth.uid()::text = "authorId" OR EXISTS (
                SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
              )));

CREATE POLICY "Users can delete own recipes or admins all" ON "Recipe"
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

-- RecipeRating table: Registered users can read all, manage own ratings
ALTER TABLE "RecipeRating" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read recipe ratings" ON "RecipeRating"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Users can manage own ratings" ON "RecipeRating"
  FOR ALL
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- ==================== MUSIC ====================

-- Playlist table: Registered users can read public playlists, admins manage all
ALTER TABLE "Playlist" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read public playlists" ON "Playlist"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         ("isPublic" = true OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

CREATE POLICY "Admins can manage playlists" ON "Playlist"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  ));

-- ==================== KIDS CORNER ====================

-- KidsAsset table: Registered users can read, admins manage
ALTER TABLE "KidsAsset" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read kids assets" ON "KidsAsset"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Admins can manage kids assets" ON "KidsAsset"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  ));

-- ==================== FEEDBACK ====================

-- Feedback table: Users can read own, create, admins read all
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feedback or admins all" ON "Feedback"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "userId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

CREATE POLICY "Registered users can create feedback" ON "Feedback"
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Admins can manage all feedback" ON "Feedback"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  ));

-- ==================== REACTIONS ====================

-- Reaction table: Registered users can read all, manage own reactions
ALTER TABLE "Reaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read reactions" ON "Reaction"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Users can manage own reactions" ON "Reaction"
  FOR ALL
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- ==================== BIBLE VERSES GAME ====================

-- BibleVerse table: Registered users can read, admins manage
ALTER TABLE "BibleVerse" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read bible verses" ON "BibleVerse"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Admins can manage bible verses" ON "BibleVerse"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  ));

-- VerseGameProgress table: Users manage own progress
ALTER TABLE "VerseGameProgress" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress" ON "VerseGameProgress"
  FOR ALL
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- ==================== NOTIFICATIONS ====================

-- NotificationPreference table: Users manage own preferences
ALTER TABLE "NotificationPreference" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON "NotificationPreference"
  FOR ALL
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- Notification table: Users read/update own notifications
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON "Notification"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId");

CREATE POLICY "Users can update own notifications" ON "Notification"
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- DeviceToken table: Users manage own device tokens
ALTER TABLE "DeviceToken" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own device tokens" ON "DeviceToken"
  FOR ALL
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         auth.uid()::text = "userId")
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "userId");

-- ==================== COMMENTS ====================

-- Comment table: Registered users can read all, create, manage own
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read comments" ON "Comment"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Registered users can create comments" ON "Comment"
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              auth.uid()::text = "authorId");

CREATE POLICY "Users can update own comments or admins all" ON "Comment"
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )))
  WITH CHECK (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
              (auth.uid()::text = "authorId" OR EXISTS (
                SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
              )));

CREATE POLICY "Users can delete own comments or admins all" ON "Comment"
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text) AND
         (auth.uid()::text = "authorId" OR EXISTS (
           SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
         )));

-- ==================== SITE SETTINGS ====================

-- SiteSettings table: Registered users can read, admins manage
ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can read site settings" ON "SiteSettings"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Admins can manage site settings" ON "SiteSettings"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'
  ));
