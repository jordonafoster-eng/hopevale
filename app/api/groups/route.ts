import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/groups
 * List all groups (SUPER_ADMIN only)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can list all groups
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const groups = await prisma.group.findMany({
      where: {
        deletedAt: null,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
