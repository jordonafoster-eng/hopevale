import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const progressSchema = z.object({
  verseId: z.string(),
  success: z.boolean(),
  time: z.number().int().positive(), // in milliseconds
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = progressSchema.parse(body);

    // Get or create progress record
    const existingProgress = await prisma.verseGameProgress.findUnique({
      where: {
        userId_verseId: {
          userId: session.user.id,
          verseId: data.verseId,
        },
      },
    });

    const progressData = {
      attempts: (existingProgress?.attempts || 0) + 1,
      successes: (existingProgress?.successes || 0) + (data.success ? 1 : 0),
      bestTime:
        data.success && (!existingProgress?.bestTime || data.time < existingProgress.bestTime)
          ? data.time
          : existingProgress?.bestTime,
      lastPlayedAt: new Date(),
    };

    const progress = await prisma.verseGameProgress.upsert({
      where: {
        userId_verseId: {
          userId: session.user.id,
          verseId: data.verseId,
        },
      },
      update: progressData,
      create: {
        userId: session.user.id,
        verseId: data.verseId,
        ...progressData,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Save progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's game statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await prisma.verseGameProgress.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        verse: {
          select: {
            reference: true,
            category: true,
          },
        },
      },
      orderBy: {
        lastPlayedAt: 'desc',
      },
    });

    const stats = {
      totalAttempts: progress.reduce((sum, p) => sum + p.attempts, 0),
      totalSuccesses: progress.reduce((sum, p) => sum + p.successes, 0),
      versesPlayed: progress.length,
      bestTime: Math.min(...progress.map(p => p.bestTime || Infinity).filter(t => t !== Infinity)),
      recentProgress: progress.slice(0, 10),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
