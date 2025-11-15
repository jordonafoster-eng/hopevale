import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { NotificationsList } from '@/components/notifications/notifications-list';

export const metadata: Metadata = {
  title: 'Notifications - Church Friends',
  description: 'View your notifications',
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Stay updated with what&apos;s happening in your community
        </p>
      </div>

      <NotificationsList />
    </div>
  );
}
