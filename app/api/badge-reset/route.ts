import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateBadgeCount } from '@/lib/push';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/badge-reset
 * Manually reset the badge count based on actual unread notifications
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get actual unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    console.log(`Resetting badge for user ${session.user.id} to ${unreadCount}`);

    // Send badge update
    const result = await updateBadgeCount(session.user.id, unreadCount);

    return NextResponse.json({
      success: true,
      unreadCount,
      badgeUpdateResult: result,
      message: `Badge reset to ${unreadCount}`,
    });
  } catch (error) {
    console.error('Error resetting badge:', error);
    return NextResponse.json(
      { error: 'Failed to reset badge' },
      { status: 500 }
    );
  }
}
