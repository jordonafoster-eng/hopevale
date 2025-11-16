import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/user/profile
 * Update user profile (name, email, image)
 * - Email changes are restricted to admins only
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, image } = body;

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = currentUser.role === 'ADMIN';

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      image?: string;
    } = {};

    // Always allow name and image updates
    if (name !== undefined) {
      updateData.name = name;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    // Only allow email updates for admins
    if (email !== undefined && email !== currentUser.email) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only administrators can change email addresses' },
          { status: 403 }
        );
      }

      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
