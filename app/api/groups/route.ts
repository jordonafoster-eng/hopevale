import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addMembership, generateUniqueSlug, setActiveGroup } from '@/lib/groups';

const createGroupSchema = z.object({
  name: z.string().trim().min(2, 'Group name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional().nullable(),
});

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
            memberships: true,
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

/**
 * POST /api/groups
 * Create a new group. Any signed-in user can do this; they become its GROUP_ADMIN
 * and it becomes their active group.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createGroupSchema.parse(body);

    const slug = await generateUniqueSlug(data.name);
    if (!slug) {
      return NextResponse.json(
        { error: 'A group with a similar name already exists. Please choose a different name.' },
        { status: 400 }
      );
    }

    const group = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
        },
      });

      await addMembership(tx, session.user.id, group.id, 'GROUP_ADMIN');
      await setActiveGroup(tx, session.user.id, group.id);

      return group;
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
