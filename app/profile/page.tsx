import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { getInitials, getAvatarColor } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Profile - Church Friends',
  description: 'Your profile information',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  const { user } = session;
  const initials = getInitials(user.name || user.email || 'U');
  const avatarColor = getAvatarColor(user.email || '');

  return (
    <div className="section">
      <div className="mx-auto max-w-2xl">
        <h1 className="heading-2">Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your profile information
        </p>

        <div className="card mt-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="h-20 w-20 rounded-full"
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${avatarColor} text-2xl font-medium text-white`}
              >
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name || 'No name set'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                Role: <span className="font-medium capitalize">{user.role?.toLowerCase() || 'Member'}</span>
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user.name || 'Not set'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Member Since
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(session.user.id).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="card mt-6 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex">
            <UserCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Profile Editing Coming Soon
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                The ability to edit your profile information will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
