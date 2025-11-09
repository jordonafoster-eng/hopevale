import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@grouplife.com';
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || '';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent:', subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: String(error) };
  }
}

interface NotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}

/**
 * Create a notification and optionally send an email
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  sendEmail = true,
}: NotificationOptions) {
  try {
    // Get user and their preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true,
      },
    });

    if (!user) {
      console.error('User not found:', userId);
      return { success: false, error: 'User not found' };
    }

    // Create the notification in the database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    // Check if email should be sent based on preferences
    const shouldSendEmail =
      sendEmail &&
      user.notificationPreferences &&
      shouldSendEmailForType(type, user.notificationPreferences);

    if (shouldSendEmail && user.email) {
      const emailHtml = generateEmailHtml(title, message, link);
      const emailResult = await sendEmail({
        to: user.email,
        subject: title,
        html: emailHtml,
        text: message,
      });

      if (emailResult.success) {
        // Update notification to mark email as sent
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        });
      }
    }

    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if email should be sent for a notification type based on user preferences
 */
function shouldSendEmailForType(
  type: NotificationType,
  prefs: any
): boolean {
  if (!prefs || !prefs.emailEnabled) return false;

  switch (type) {
    case 'NEW_EVENT':
      return prefs.emailNewEvent;
    case 'EVENT_REMINDER':
      return prefs.emailEventReminder;
    case 'RSVP_CONFIRMATION':
      return prefs.emailRsvpConfirmation;
    case 'PRAYER_REACTION':
      return prefs.emailPrayerReaction;
    case 'NEW_REFLECTION':
      return prefs.emailNewReflection;
    case 'WEEKLY_DIGEST':
      return prefs.emailWeeklyDigest;
    case 'SYSTEM':
      return true; // Always send system notifications
    default:
      return false;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(
  title: string,
  message: string,
  link?: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #4f46e5;
    }
    .header h1 {
      color: #4f46e5;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .content h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .content p {
      color: #4b5563;
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4f46e5;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Group Life</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      <p>${message}</p>
      ${link ? `<a href="${link}" class="button">View Details</a>` : ''}
    </div>
    <div class="footer">
      <p>You received this email because you're a member of Group Life.</p>
      <p>To manage your notification preferences, <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hopevale-tsvsq.ondigitalocean.app'}/settings">visit your settings</a>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send email to admin (for feedback, new submissions, etc.)
 */
export async function sendAdminEmail(subject: string, content: string) {
  if (!ADMIN_EMAIL) {
    console.warn('RESEND_ADMIN_EMAIL not configured. Admin email not sent.');
    return { success: false, error: 'Admin email not configured' };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9fafb;
      padding: 30px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .content {
      background: white;
      padding: 20px;
      border-radius: 6px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Group Life Admin Notification</h2>
    <div class="content">
      ${content}
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      This is an automated notification from Group Life.
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Group Life Admin] ${subject}`,
    html,
    text: content,
  });
}

/**
 * Get or create notification preferences for a user
 */
export async function getOrCreateNotificationPreferences(userId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId },
    });
  }

  return prefs;
}
