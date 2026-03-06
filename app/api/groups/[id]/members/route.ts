import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyGroupMembership, canManageGroup } from '@/lib/auth-utils';

const moveMemberSchema = z.object({
  userId: z.string(),
  targetGroupId: z.string().nullable(),
});

/**
 * GET /api/groups/[id]/members
 * List members of a group (members can see other members, GROUP_ADMIN+ can see full details)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Must be member of group or SUPER_ADMIN
    const isMember = await verifyGroupMembership(id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const canManage = await canManageGroup(id);

    const members = await prisma.user.findMany({
      where: {
        groupId: id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        // Only include email for admins
        ...(canManage ? { email: true } : {}),
      },
      orderBy: [
        { role: 'desc' }, // GROUP_ADMIN first
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/members?userId=xxx
 * Remove a member from the group (GROUP_ADMIN or SUPER_ADMIN)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: groupId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if user can manage this group
    const canManage = await canManageGroup(groupId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot remove yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the group' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is in this group
    if (targetUser.groupId !== groupId) {
      return NextResponse.json(
        { error: 'User is not in this group' },
        { status: 400 }
      );
    }

    // GROUP_ADMIN cannot remove SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot remove a SUPER_ADMIN' },
        { status: 403 }
      );
    }

    // GROUP_ADMIN cannot remove other GROUP_ADMINs (only SUPER_ADMIN can)
    if (targetUser.role === 'GROUP_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can remove GROUP_ADMINs' },
        { status: 403 }
      );
    }

    // Remove user from group (set groupId to null)
    await prisma.user.update({
      where: { id: userId },
      data: { groupId: null },
    });

    return NextResponse.json({ message: 'Member removed from group' });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]/members
 * Move a member to a different group (SUPER_ADMIN only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: groupId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can move users between groups
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can move members between groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, targetGroupId } = moveMemberSchema.parse(body);

    // Cannot move yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot move yourself' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is in the source group
    if (targetUser.groupId !== groupId) {
      return NextResponse.json(
        { error: 'User is not in this group' },
        { status: 400 }
      );
    }

    // If moving to a new group, verify the target group exists
    if (targetGroupId) {
      const targetGroup = await prisma.group.findUnique({
        where: { id: targetGroupId },
      });

      if (!targetGroup || targetGroup.deletedAt) {
        return NextResponse.json(
          { error: 'Target group not found' },
          { status: 404 }
        );
      }
    }

    // Move user to new group
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { groupId: targetGroupId },
      select: {
        id: true,
        name: true,
        email: true,
        groupId: true,
        group: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      message: targetGroupId
        ? `Member moved to ${updatedUser.group?.name}`
        : 'Member removed from group',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error moving member:', error);
    return NextResponse.json(
      { error: 'Failed to move member' },
      { status: 500 }
    );
  }
}
