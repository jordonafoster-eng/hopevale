import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MEMBER', 'GROUP_ADMIN', 'SUPER_ADMIN']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Must be GROUP_ADMIN or SUPER_ADMIN to create users
    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Only SUPER_ADMIN can create SUPER_ADMIN users
    if (data.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can create SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    // GROUP_ADMIN must have a group to add users to
    if (session.user.role === 'GROUP_ADMIN' && !session.user.groupId) {
      return NextResponse.json(
        { error: 'You must belong to a group to create users' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12);

    // Determine the groupId for the new user
    // - GROUP_ADMIN creates users in their own group
    // - SUPER_ADMIN can create users without a group (for other SUPER_ADMINs)
    //   or in any group (would need additional param, for now use their group)
    const groupId = session.user.role === 'SUPER_ADMIN' && data.role === 'SUPER_ADMIN'
      ? session.user.groupId // SUPER_ADMIN can have a home group
      : session.user.groupId;

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        status: 'ACTIVE',
        groupId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        groupId: true,
        createdAt: true,
      },
    });

    // Create default notification preferences
    await prisma.notificationPreference.create({
      data: { userId: user.id },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
