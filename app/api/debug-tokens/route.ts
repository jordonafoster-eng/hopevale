import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug-tokens
 * Check device tokens for current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await prisma.deviceToken.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        platform: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      userId: session.user.id,
      userEmail: session.user.email,
      deviceTokens: tokens,
      tokenCount: tokens.length,
      notificationPreferences: preferences,
    });
  } catch (error) {
    console.error('Error fetching debug info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    );
  }
}
