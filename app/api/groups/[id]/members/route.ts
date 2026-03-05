import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyGroupMembership, canManageGroup } from '@/lib/auth-utils';

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
