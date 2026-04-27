import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/users/search?q=searchTerm
 * Returns users in the same group as the current user matching the search term.
 * Used for @mention autocomplete in comments.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';

    // Get current user's groupId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { groupId: true },
    });

    if (!currentUser?.groupId) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        groupId: currentUser.groupId,
        id: { not: session.user.id },
        status: 'ACTIVE',
        ...(q.length > 0
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: { id: true, name: true, email: true, image: true },
      take: 8,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
