import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const reactionSchema = z.object({
  reactionType: z.string().default('prayed'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reactionType } = reactionSchema.parse(body);

    // Check if prayer exists
    const prayer = await prisma.prayer.findUnique({
      where: { id: params.id },
    });

    if (!prayer) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }

    // Check if user already reacted
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId_reactionType: {
          userId: session.user.id,
          targetType: 'prayer',
          targetId: params.id,
          reactionType,
        },
      },
    });

    if (existingReaction) {
      return NextResponse.json(
        { error: 'Already reacted' },
        { status: 400 }
      );
    }

    // Create reaction and update count
    await prisma.$transaction([
      prisma.reaction.create({
        data: {
          userId: session.user.id,
          targetType: 'prayer',
          targetId: params.id,
          reactionType,
        },
      }),
      prisma.prayer.update({
        where: { id: params.id },
        data: {
          reactionsCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ message: 'Reaction added successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Reaction creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reactionType } = reactionSchema.parse(body);

    // Delete reaction and update count
    const result = await prisma.$transaction(async (tx) => {
      const reaction = await tx.reaction.deleteMany({
        where: {
          userId: session.user.id,
          targetType: 'prayer',
          targetId: params.id,
          reactionType,
        },
      });

      if (reaction.count > 0) {
        await tx.prayer.update({
          where: { id: params.id },
          data: {
            reactionsCount: {
              decrement: 1,
            },
          },
        });
      }

      return reaction;
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Reaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Reaction deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
