import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const roleSchema = z.object({
  role: z.enum(['MEMBER', 'GROUP_ADMIN', 'SUPER_ADMIN']),
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
    const { role: newRole } = roleSchema.parse(body);

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

    // GROUP_ADMIN can only manage users in their own group
    if (session.user.role === 'GROUP_ADMIN') {
      if (targetUser.groupId !== session.user.groupId) {
        return NextResponse.json(
          { error: 'Cannot manage users outside your group' },
          { status: 403 }
        );
      }
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: newRole },
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
