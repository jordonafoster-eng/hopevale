import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/groups/join?token=xxx
 * Validate an invite token and return group info (public endpoint for signup page)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const invite = await prisma.groupInvite.findUnique({
      where: { token },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: 'Invalid invite link' },
        { status: 404 }
      );
    }

    if (invite.usedAt) {
      return NextResponse.json(
        { valid: false, error: 'This invite has already been used' },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'This invite has expired' },
        { status: 400 }
      );
    }

    if (invite.group.deletedAt) {
      return NextResponse.json(
        { valid: false, error: 'This group no longer exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      group: {
        name: invite.group.name,
        slug: invite.group.slug,
      },
      // Don't expose the target email or role for security
      emailRestricted: !!invite.email,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
