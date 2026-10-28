import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { acceptInvite, findUsableInvite } from '@/lib/groups';

const joinSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

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

    const result = await findUsableInvite(token);

    if ('error' in result) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      valid: true,
      group: {
        name: result.invite.group.name,
        slug: result.invite.group.slug,
      },
      // Don't expose the target email or role for security
      emailRestricted: !!result.invite.email,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/join
 * Accept an invite as an already signed-in user. Adds them to the group
 * (keeping their other groups) and makes it their active group.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = joinSchema.parse(body);

    const result = await findUsableInvite(token);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { invite } = result;

    if (invite.email && invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invite is for a different email address' },
        { status: 403 }
      );
    }

    await prisma.$transaction((tx) => acceptInvite(tx, session.user.id, invite));

    return NextResponse.json({
      message: `You joined ${invite.group.name}`,
      group: { id: invite.group.id, name: invite.group.name, slug: invite.group.slug },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Failed to join group' },
      { status: 500 }
    );
  }
}
