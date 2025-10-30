import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { UserRoleToggle } from '@/components/admin/user-role-toggle';
import { UserInviteForm } from '@/components/admin/user-invite-form';
import { UserManagementActions } from '@/components/admin/user-management-actions';

export const metadata: Metadata = {
  title: 'User Management - Admin',
  description: 'Manage users and roles',
};

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      image: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function AdminUsersPage() {
  const adminUser = await isAdmin();
  const session = await auth();

  if (!adminUser) {
    redirect('/');
  }

  const users = await getUsers();

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="heading-2">User Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create new users and manage roles and permissions
          </p>
        </div>

        {/* Invite User Form */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invite New User
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create a new user account. They&apos;ll be able to sign in with the email and password you provide.
          </p>
          <UserInviteForm />
        </div>

        {/* Users Table */}
        <div className="card mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || 'No name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <UserRoleToggle
                          userId={user.id}
                          currentRole={user.role}
                          disabled={user.id === session?.user?.id}
                        />
                        <UserManagementActions
                          userId={user.id}
                          userName={user.name || user.email}
                          userStatus={user.status}
                          disabled={user.id === session?.user?.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
