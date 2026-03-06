import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { canManageGroup } from '@/lib/auth-utils';

const updateGroupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  restore: z.boolean().optional(),
});

/**
 * GET /api/groups/[id]
 * Get a specific group's details
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

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            prayers: true,
            events: true,
            reflections: true,
            recipes: true,
          },
        },
      },
    });

    if (!group || group.deletedAt) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check access: must be member of group or SUPER_ADMIN
    if (session.user.role !== 'SUPER_ADMIN' && session.user.groupId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]
 * Update a group (GROUP_ADMIN of that group or SUPER_ADMIN)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage this group
    const canManage = await canManageGroup(id);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateGroupSchema.parse(body);

    // Handle restore (SUPER_ADMIN only)
    if (data.restore) {
      if (session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only SUPER_ADMIN can restore groups' }, { status: 403 });
      }

      const group = await prisma.group.update({
        where: { id },
        data: { deletedAt: null },
      });

      return NextResponse.json({ group, message: 'Group restored successfully' });
    }

    // Regular update
    const { restore, ...updateData } = data;
    const group = await prisma.group.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error updating group:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Soft-delete a group (SUPER_ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can delete groups
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete the group (archive)
    const group = await prisma.group.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Group archived successfully',
      group
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
