import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/switch-group
 * Switch the SUPER_ADMIN's viewing group context
 * Body: { groupId: string | null } - null means view all groups
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can switch group view
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { groupId } = body;

    // If groupId is provided, verify it exists
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group || group.deletedAt) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
    }

    // The actual session update happens on the client side using
    // NextAuth's update() function. This endpoint just validates
    // and returns the group info.

    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      return NextResponse.json({
        viewingGroupId: groupId,
        viewingGroup: group,
        message: `Now viewing group: ${group?.name}`,
      });
    }

    return NextResponse.json({
      viewingGroupId: null,
      viewingGroup: null,
      message: 'Now viewing all groups',
    });
  } catch (error) {
    console.error('Error switching group:', error);
    return NextResponse.json(
      { error: 'Failed to switch group' },
      { status: 500 }
    );
  }
}
