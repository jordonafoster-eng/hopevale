import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

// Lazy initialize Firebase Admin SDK
function getFirebaseApp(): App | null {
  if (!process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase credentials not configured. Push notifications will not be sent.');
    return null;
  }

  // Check if app is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Initialize Firebase Admin
  try {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}

interface PushNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
}

/**
 * Send a push notification to a specific device token
 */
export async function sendPushNotification({
  token,
  title,
  body,
  data = {},
  badge = 1,
}: PushNotificationOptions) {
  const app = getFirebaseApp();

  if (!app) {
    console.warn('Firebase not initialized. Push notification not sent.');
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    const messaging = getMessaging(app);

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: badge,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('Push notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Error sending push notification:', error);

    // Handle invalid or expired tokens
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      console.log('Removing invalid token:', token);
      await prisma.deviceToken.delete({ where: { token } }).catch(() => {});
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send push notifications to all of a user's devices
 */
export async function sendPushToUser({
  userId,
  title,
  body,
  link,
  badge,
}: {
  userId: string;
  title: string;
  body: string;
  link?: string;
  badge?: number;
}) {
  try {
    // Get all device tokens for the user
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId },
    });

    if (deviceTokens.length === 0) {
      console.log('No device tokens found for user:', userId);
      return { success: true, sent: 0 };
    }

    // Prepare data payload
    const data: Record<string, string> = {};
    if (link) {
      data.link = link;
    }

    // Send to all devices
    const results = await Promise.allSettled(
      deviceTokens.map(deviceToken =>
        sendPushNotification({
          token: deviceToken.token,
          title,
          body,
          data,
          badge,
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`Sent push notifications to ${successful}/${deviceTokens.length} devices for user:`, userId);

    return { success: true, sent: successful, total: deviceTokens.length };
  } catch (error) {
    console.error('Error sending push notifications to user:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send a silent push notification to update badge count only
 * This is used when notifications are marked as read or deleted
 */
export async function updateBadgeCount(userId: string, badgeCount: number) {
  try {
    // Get all device tokens for the user
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId },
    });

    if (deviceTokens.length === 0) {
      console.log('No device tokens found for user:', userId);
      return { success: true, sent: 0 };
    }

    const app = getFirebaseApp();
    if (!app) {
      console.warn('Firebase not initialized. Badge update not sent.');
      return { success: false, error: 'Firebase not configured' };
    }

    const messaging = getMessaging(app);

    // Send silent notification to each device to update badge
    const results = await Promise.allSettled(
      deviceTokens.map(async (deviceToken) => {
        try {
          const message = {
            token: deviceToken.token,
            apns: {
              payload: {
                aps: {
                  badge: badgeCount,
                  // Silent notification - no alert or sound
                  'content-available': 1,
                },
              },
            },
            // Empty data payload for silent notification
            data: {
              type: 'badge-update',
            },
          };

          const response = await messaging.send(message);
          console.log('Badge update sent successfully:', response);
          return { success: true, messageId: response };
        } catch (error: any) {
          console.error('Error sending badge update:', error);

          // Handle invalid or expired tokens
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            console.log('Removing invalid token:', deviceToken.token);
            await prisma.deviceToken.delete({ where: { token: deviceToken.token } }).catch(() => {});
          }

          return { success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`Sent badge updates to ${successful}/${deviceTokens.length} devices for user:`, userId);

    return { success: true, sent: successful, total: deviceTokens.length };
  } catch (error) {
    console.error('Error updating badge count:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if push notification should be sent for a notification type based on user preferences
 */
export function shouldSendPushForType(
  type: NotificationType,
  prefs: any
): boolean {
  if (!prefs || !prefs.pushEnabled) return false;

  switch (type) {
    case 'NEW_EVENT':
      return prefs.pushNewEvent;
    case 'EVENT_REMINDER':
      return prefs.pushEventReminder;
    case 'PRAYER_REACTION':
      return prefs.pushPrayerReaction;
    case 'RSVP_CONFIRMATION':
    case 'NEW_REFLECTION':
    case 'WEEKLY_DIGEST':
      return false; // Not supported for push yet
    case 'SYSTEM':
      return true; // Always send system notifications
    default:
      return false;
  }
}
