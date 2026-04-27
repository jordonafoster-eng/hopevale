import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/email';

// Mention format: @[Display Name](userId)
const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

export function parseMentions(body: string): Array<{ name: string; userId: string }> {
  const mentions: Array<{ name: string; userId: string }> = [];
  let match;
  const regex = new RegExp(MENTION_REGEX.source, 'g');
  while ((match = regex.exec(body)) !== null) {
    mentions.push({ name: match[1], userId: match[2] });
  }
  // Deduplicate by userId
  return mentions.filter((m, i, arr) => arr.findIndex((x) => x.userId === m.userId) === i);
}

interface CommentNotificationOptions {
  commentId: string;
  commentBody: string;
  commentAuthorId: string;
  commentAuthorName: string;
  contentType: 'prayer' | 'reflection' | 'recipe' | 'event';
  contentTitle: string;
  contentLink: string;
  contentOwnerId: string | null; // null for anonymous prayers
}

export async function sendCommentNotifications({
  commentId,
  commentBody,
  commentAuthorId,
  commentAuthorName,
  contentType,
  contentTitle,
  contentLink,
  contentOwnerId,
}: CommentNotificationOptions) {
  const mentions = parseMentions(commentBody);

  // Save mention records
  if (mentions.length > 0) {
    await prisma.commentMention.createMany({
      data: mentions.map((m) => ({ commentId, userId: m.userId })),
      skipDuplicates: true,
    });
  }

  const notifiedUserIds = new Set<string>();

  // Notify content owner (unless they are the commenter)
  if (contentOwnerId && contentOwnerId !== commentAuthorId) {
    const contentLabel = contentTypeLabel(contentType);
    await createNotification({
      userId: contentOwnerId,
      type: 'COMMENT_ON_CONTENT',
      title: `New comment on your ${contentLabel}`,
      message: `${commentAuthorName} commented on your ${contentLabel} "${contentTitle}".`,
      link: contentLink,
    });
    notifiedUserIds.add(contentOwnerId);
  }

  // Notify mentioned users (unless they are the commenter or already notified as owner)
  for (const mention of mentions) {
    if (mention.userId === commentAuthorId) continue;
    if (notifiedUserIds.has(mention.userId)) continue;

    await createNotification({
      userId: mention.userId,
      type: 'MENTION_IN_COMMENT',
      title: `${commentAuthorName} mentioned you in a comment`,
      message: `${commentAuthorName} mentioned you in a comment on "${contentTitle}".`,
      link: contentLink,
    });
    notifiedUserIds.add(mention.userId);
  }
}

function contentTypeLabel(type: CommentNotificationOptions['contentType']): string {
  switch (type) {
    case 'prayer': return 'prayer request';
    case 'reflection': return 'reflection';
    case 'recipe': return 'recipe';
    case 'event': return 'event';
  }
}
