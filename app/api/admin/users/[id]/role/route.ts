import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canManageGroup } from '@/lib/auth-utils';
import { addMembership, getMembershipRole, setActiveGroup, updateMembershipRole } from '@/lib/groups';

const roleSchema = z.object({
  role: z.enum(['MEMBER', 'GROUP_ADMIN', 'SUPER_ADMIN']),
  // Group whose role is being changed; defaults to the admin's active group
  groupId: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    // Must be GROUP_ADMIN or SUPER_ADMIN to change roles
    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role: newRole, groupId: requestedGroupId } = roleSchema.parse(body);

    // Prevent user from changing their own role
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (newRole === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can assign SUPER_ADMIN role' },
        { status: 403 }
      );
    }

    // Only SUPER_ADMIN can change a SUPER_ADMIN's role
    if (targetUser.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can modify another SUPER_ADMIN' },
        { status: 403 }
      );
    }

    // SUPER_ADMIN is a global role, stored only on the user
    if (newRole === 'SUPER_ADMIN' || targetUser.role === 'SUPER_ADMIN') {
      const user = await prisma.user.update({
        where: { id: params.id },
        data: { role: newRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'MEMBER' },
        select: { id: true, name: true, email: true, role: true, groupId: true },
      });

      // Restore their group role when demoting from SUPER_ADMIN
      if (newRole !== 'SUPER_ADMIN' && user.groupId) {
        const groupId = user.groupId;
        await prisma.$transaction(async (tx) => {
          await addMembership(tx, user.id, groupId, newRole);
          await setActiveGroup(tx, user.id, groupId);
        });
      }

      return NextResponse.json(user);
    }

    // Group roles are per-membership; admins can only change roles in groups they manage
    const groupId = requestedGroupId ?? session.user.groupId;
    if (!groupId || !(await canManageGroup(groupId))) {
      return NextResponse.json(
        { error: 'Cannot manage users outside your group' },
        { status: 403 }
      );
    }

    if (!(await getMembershipRole(params.id, groupId))) {
      return NextResponse.json(
        { error: 'User is not in this group' },
        { status: 400 }
      );
    }

    await prisma.$transaction((tx) => updateMembershipRole(tx, params.id, groupId, newRole));

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        groupId: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
