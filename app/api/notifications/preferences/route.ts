import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateNotificationPreferences } from '@/lib/email';

/**
 * GET /api/notifications/preferences
 * Get current user's notification preferences
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await getOrCreateNotificationPreferences(
      session.user.id
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update current user's notification preferences
 */
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const allowedFields = [
      'emailEnabled',
      'emailNewEvent',
      'emailEventReminder',
      'emailRsvpConfirmation',
      'emailPrayerReaction',
      'emailNewReflection',
      'emailWeeklyDigest',
      'pushEnabled',
      'pushNewEvent',
      'pushEventReminder',
      'pushPrayerReaction',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body && typeof body[field] === 'boolean') {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Get or create preferences first
    await getOrCreateNotificationPreferences(session.user.id);

    // Update preferences
    const preferences = await prisma.notificationPreference.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
