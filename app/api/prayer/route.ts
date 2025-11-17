import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const prayerSchema = z.object({
  type: z.enum(['REQUEST', 'PRAISE']),
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(1000),
  isAnonymous: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = prayerSchema.parse(body);

    // Check site settings for moderation requirement
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    const requiresModeration = settings?.requireModeration ?? false;

    // Create prayer
    const prayer = await prisma.prayer.create({
      data: {
        title: validatedData.title,
        body: validatedData.body,
        type: validatedData.type,
        isAnonymous: validatedData.isAnonymous,
        authorId: validatedData.isAnonymous ? null : session.user.id,
        isApproved: !requiresModeration, // Auto-approve if moderation not required
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      prayer,
      requiresModeration,
      message: requiresModeration
        ? 'Your prayer has been submitted and is awaiting approval.'
        : 'Your prayer has been published!'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Prayer creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
