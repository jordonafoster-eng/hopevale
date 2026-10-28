import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { MyGroups } from '@/components/groups/my-groups';

export const metadata: Metadata = {
  title: 'My Groups - Church Friends',
  description: 'Create, join, and switch between your groups',
};

export default async function GroupsPage() {
  const session = await requireAuth();

  const memberships = await prisma.groupMembership.findMany({
    where: { userId: session.user.id, group: { deletedAt: null } },
    select: {
      role: true,
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { memberships: true } },
        },
      },
    },
    orderBy: { group: { name: 'asc' } },
  });

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="heading-2">My Groups</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Start your own group, invite friends, or join a group you&apos;ve been invited to
          </p>
        </div>

        <MyGroups
          activeGroupId={session.user.groupId}
          groups={memberships.map(({ role, group }) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            memberCount: group._count.memberships,
            role: role as 'MEMBER' | 'GROUP_ADMIN',
          }))}
        />
      </div>
    </div>
  );
}
