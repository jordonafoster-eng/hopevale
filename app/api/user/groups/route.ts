import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMembershipRole, setActiveGroup } from '@/lib/groups';

const switchGroupSchema = z.object({
  groupId: z.string().min(1, 'groupId is required'),
});

/**
 * GET /api/user/groups
 * List the groups the current user belongs to
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.groupMembership.findMany({
      where: { userId: session.user.id, group: { deletedAt: null } },
      select: {
        role: true,
        group: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { group: { name: 'asc' } },
    });

    return NextResponse.json({
      activeGroupId: session.user.groupId,
      groups: memberships.map((m) => ({ ...m.group, role: m.role })),
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/groups
 * Switch the current user's active group. The client should call
 * NextAuth's update() afterwards to refresh the session.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { groupId } = switchGroupSchema.parse(body);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, deletedAt: true },
    });

    if (!group || group.deletedAt) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (!(await getMembershipRole(session.user.id, groupId))) {
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
    }

    await prisma.$transaction((tx) => setActiveGroup(tx, session.user.id, groupId));

    return NextResponse.json({ message: `Switched to ${group.name}`, groupName: group.name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error switching group:', error);
    return NextResponse.json(
      { error: 'Failed to switch group' },
      { status: 500 }
    );
  }
}
