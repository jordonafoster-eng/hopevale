import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { canManageGroup } from '@/lib/auth-utils';
import { randomBytes } from 'crypto';

const createInviteSchema = z.object({
  email: z.string().email().optional().nullable(),
  role: z.enum(['MEMBER', 'GROUP_ADMIN']).default('MEMBER'),
  expiresInDays: z.number().min(1).max(30).default(7),
});

/**
 * GET /api/groups/[id]/invites
 * List invites for a group (GROUP_ADMIN of that group or SUPER_ADMIN)
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

    // Check if user can manage this group
    const canManage = await canManageGroup(id);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invites = await prisma.groupInvite.findMany({
      where: {
        groupId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/invites
 * Create a new invite link (GROUP_ADMIN of that group or SUPER_ADMIN)
 */
export async function POST(
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

    // Only SUPER_ADMIN can create invites with GROUP_ADMIN role
    const body = await request.json();
    const data = createInviteSchema.parse(body);

    if (data.role === 'GROUP_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      // GROUP_ADMIN can only create MEMBER invites
      // unless they're inviting for their own group
      if (session.user.role !== 'GROUP_ADMIN' || session.user.groupId !== id) {
        return NextResponse.json(
          { error: 'Only SUPER_ADMIN can create GROUP_ADMIN invites' },
          { status: 403 }
        );
      }
    }

    // Verify the group exists and is not deleted
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group || group.deletedAt) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Generate a unique token
    const token = randomBytes(32).toString('hex');

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    const invite = await prisma.groupInvite.create({
      data: {
        groupId: id,
        email: data.email?.toLowerCase() || null,
        token,
        role: data.role,
        expiresAt,
      },
    });

    // Generate the full invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/auth/signup?invite=${token}`;

    return NextResponse.json(
      {
        invite,
        inviteUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invite:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/invites
 * Delete an invite (GROUP_ADMIN of that group or SUPER_ADMIN)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    // Get the invite to check group ownership
    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user can manage this group
    const canManage = await canManageGroup(invite.groupId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.groupInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ message: 'Invite deleted' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json(
      { error: 'Failed to delete invite' },
      { status: 500 }
    );
  }
}
