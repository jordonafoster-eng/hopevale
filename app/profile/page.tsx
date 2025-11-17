import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { ProfileEditForm } from '@/components/settings/profile-edit-form';

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
  const isAdmin = user.role === 'ADMIN';
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

        {/* Edit Profile */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h3>
          <div className="mt-4">
            <ProfileEditForm
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              }}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
