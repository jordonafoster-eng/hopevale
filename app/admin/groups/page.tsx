import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-utils';
import {
  BuildingOffice2Icon,
  UsersIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { GroupActions } from '@/components/admin/group-actions';

export const metadata: Metadata = {
  title: 'All Groups - Admin',
  description: 'Manage all groups across the platform',
};

export default async function AllGroupsPage() {
  await requireSuperAdmin();

  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: {
          users: true,
          prayers: true,
          reflections: true,
          events: true,
          recipes: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const activeGroups = groups.filter((g) => !g.deletedAt);
  const archivedGroups = groups.filter((g) => g.deletedAt);

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        <div>
          <h1 className="heading-2">All Groups</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all groups across the platform
          </p>
        </div>

        {/* Active Groups */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Groups ({activeGroups.length})
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGroups.map((group) => (
              <div key={group.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                      <BuildingOffice2Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        /{group.slug}
                      </p>
                    </div>
                  </div>
                  <GroupActions groupId={group.id} groupName={group.name} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <UsersIcon className="h-4 w-4" />
                    {group._count.users} members
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {group._count.prayers + group._count.reflections + group._count.events + group._count.recipes} items
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Archived Groups */}
        {archivedGroups.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Archived Groups ({archivedGroups.length})
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {archivedGroups.map((group) => (
                <div key={group.id} className="card opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <TrashIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Archived {group.deletedAt ? new Date(group.deletedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <GroupActions groupId={group.id} groupName={group.name} isArchived />
                  </div>

                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {group._count.users} members | {group._count.prayers + group._count.reflections + group._count.events + group._count.recipes} items archived
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groups.length === 0 && (
          <div className="card mt-8 text-center">
            <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No groups yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Groups will appear here as users sign up and create them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
