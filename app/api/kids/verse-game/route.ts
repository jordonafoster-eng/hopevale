import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Get random verses for the game
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '6');

    // Get random verses, prioritizing popular ones
    const verses = await prisma.bibleVerse.findMany({
      orderBy: {
        popularity: 'desc',
      },
      take: count * 2, // Get more than we need
    });

    // Randomize the selection
    const shuffled = verses.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return NextResponse.json(selected);
  } catch (error) {
    console.error('Get verses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
