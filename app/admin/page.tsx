import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';
import {
  UsersIcon,
  SparklesIcon,
  MusicalNoteIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Community Hub',
  description: 'Manage your community hub',
};

export default async function AdminDashboardPage() {
  const session = await auth();
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect('/');
  }

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        <div>
          <h1 className="heading-2">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your community hub content and users
          </p>
        </div>

        {/* Admin Actions Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* User Management */}
          <Link
            href="/admin/users"
            className="card group hover:border-brand-500 hover:shadow-lg"
          >
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/20">
                <UsersIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Management
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage users, roles, and invite admins
                </p>
              </div>
            </div>
          </Link>

          {/* Kids Corner Management */}
          <Link
            href="/admin/kids"
            className="card group hover:border-purple-500 hover:shadow-lg"
          >
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kids Corner
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Upload and manage coloring pages, verses
                </p>
              </div>
            </div>
          </Link>

          {/* Music Management */}
          <Link
            href="/admin/music"
            className="card group hover:border-blue-500 hover:shadow-lg"
          >
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <MusicalNoteIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Music Playlists
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage YouTube playlists and links
                </p>
              </div>
            </div>
          </Link>

          {/* Content Moderation */}
          <div className="card opacity-60">
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content Moderation
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Approve prayers and reflections
                </p>
                <p className="mt-2 text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome, {session?.user?.name || 'Admin'}!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Use the panels above to manage your community hub. Click on any card to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
