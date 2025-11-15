import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendPushToUser } from '@/lib/push';

/**
 * POST /api/test-push
 * Send a test push notification to the current user
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, badge } = body;

    // Send test push notification
    const result = await sendPushToUser({
      userId: session.user.id,
      title: title || '🔔 Test Notification',
      body: message || 'This is a test push notification from Church Friends!',
      link: '/notifications',
      badge: badge || 1,
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      ...result,
    });
  } catch (error) {
    console.error('Error sending test push:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
