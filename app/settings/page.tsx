import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import {
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Settings - Church Friends',
  description: 'Manage your account settings',
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/settings');
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-2">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account preferences and settings
        </p>

        {/* Admin Panel - Only visible to admins */}
        {isAdmin && (
          <Link href="/admin" className="card mt-6 block hover:border-brand-500 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/20">
                <ShieldCheckIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Panel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage users, content, and site settings
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Notification Preferences */}
        <div className="card mt-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage email and push notification settings
              </p>
            </div>
          </div>
          <div className="mt-6">
            <NotificationPreferences />
          </div>
        </div>

        {/* Change Password */}
        <div className="card mt-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/20">
              <KeyIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your account password
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
