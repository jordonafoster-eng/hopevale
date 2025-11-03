import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import {
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  UserGroupIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Settings - Community Hub',
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

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Admin Panel - Only visible to admins */}
          {isAdmin && (
            <Link href="/admin" className="card hover:border-brand-500">
              <div className="flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/20">
                  <ShieldCheckIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Panel
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage users, content, and site settings
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Notifications */}
          <div className="card opacity-60">
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Email and push notification preferences
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card opacity-60">
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <PaintBrushIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Theme and display preferences
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="card opacity-60">
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Privacy & Security
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Control your privacy and security settings
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Information
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {session.user.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Role</span>
              <span className="font-medium capitalize text-gray-900 dark:text-white">
                {session.user.role?.toLowerCase() || 'Member'}
              </span>
            </div>
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
