import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const reflectionSchema = z.object({
  title: z.string().min(5).max(100),
  body: z.string().min(50).max(2000),
  tags: z.array(z.string()).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reflectionSchema.parse(body);

    // Check site settings for moderation requirement
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    const requiresModeration = settings?.requireModeration ?? false;

    // Create reflection
    const reflection = await prisma.reflection.create({
      data: {
        title: validatedData.title,
        body: validatedData.body,
        tags: validatedData.tags,
        authorId: session.user.id,
        isApproved: !requiresModeration,
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

    return NextResponse.json(reflection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Reflection creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
