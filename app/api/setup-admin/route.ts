import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// This is a one-time setup endpoint to create the initial admin user
// After creating your admin, you should delete this file for security

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Simple security check - you can change this secret
    if (body.setupSecret !== 'hopevale2025setup') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = 'jordonafoster@gmail.com';
    const password = 'wohxaB-dangyq-xuxxy0';
    const name = 'Jordon Foster';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const hashedPassword = await hash(password, 12);

    if (existingUser) {
      // Update existing user to admin with new password
      const user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          name: existingUser.name || name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        user,
      });
    } else {
      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        user,
      });
    }
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin' },
      { status: 500 }
    );
  }
}
