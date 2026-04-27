-- Migration: Add recipe comments, comment mentions, and comment/mention notifications

-- Add recipeId to Comment table
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "recipeId" TEXT;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_recipeId_fkey"
  FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Comment_recipeId_idx" ON "Comment"("recipeId");

-- Add CommentMention table
CREATE TABLE IF NOT EXISTS "CommentMention" (
  "id"        TEXT NOT NULL,
  "commentId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentMention_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CommentMention_commentId_userId_key" ON "CommentMention"("commentId", "userId");
CREATE INDEX IF NOT EXISTS "CommentMention_commentId_idx" ON "CommentMention"("commentId");
CREATE INDEX IF NOT EXISTS "CommentMention_userId_idx" ON "CommentMention"("userId");
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_commentId_fkey"
  FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new NotificationType enum values
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COMMENT_ON_CONTENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MENTION_IN_COMMENT';

-- Add new notification preference fields
ALTER TABLE "NotificationPreference" ADD COLUMN IF NOT EXISTS "emailCommentOnContent" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationPreference" ADD COLUMN IF NOT EXISTS "emailMentionInComment" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationPreference" ADD COLUMN IF NOT EXISTS "pushCommentOnContent"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationPreference" ADD COLUMN IF NOT EXISTS "pushMentionInComment"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationPreference" ADD COLUMN IF NOT EXISTS "inAppCommentOnContent" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationPreference" ADD COLUMN IF NOT EXISTS "inAppMentionInComment" BOOLEAN NOT NULL DEFAULT true;
