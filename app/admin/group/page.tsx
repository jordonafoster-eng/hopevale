import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireGroupAdmin } from '@/lib/auth-utils';
import { GroupSettings } from '@/components/admin/group-settings';

export const metadata: Metadata = {
  title: 'Group Settings - Admin',
  description: 'Manage your group settings and invites',
};

export default async function GroupSettingsPage() {
  const session = await requireGroupAdmin();

  if (!session.user.groupId) {
    redirect('/');
  }

  const group = await prisma.group.findUnique({
    where: { id: session.user.groupId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      invites: {
        where: {
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          email: true,
          token: true,
          role: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!group) {
    redirect('/');
  }

  // Fetch all groups for SUPER_ADMIN to use in move dropdown
  let allGroups: { id: string; name: string }[] = [];
  if (session.user.role === 'SUPER_ADMIN') {
    allGroups = await prisma.group.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="heading-2">Group Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage {group.name} settings, members, and invitations
          </p>
        </div>

        <GroupSettings
          group={{
            id: group.id,
            name: group.name,
            slug: group.slug,
            description: group.description,
          }}
          members={group.users}
          invites={group.invites}
          currentUserId={session.user.id}
          isSuperAdmin={session.user.role === 'SUPER_ADMIN'}
          allGroups={allGroups}
        />
      </div>
    </div>
  );
}
