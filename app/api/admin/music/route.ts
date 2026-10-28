import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { resolveNewContentGroup } from '@/lib/auth-utils';

const playlistSchema = z.object({
  title: z.string().min(1),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  spotifyUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  isGlobal: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = playlistSchema.parse(body);

    const target = await resolveNewContentGroup(data.isGlobal);
    if ('error' in target) {
      return NextResponse.json({ error: target.error }, { status: target.status });
    }
    const { groupId } = target;

    // Get the max sortOrder within the group and add 1
    const maxOrderPlaylist = await prisma.playlist.findFirst({
      where: { groupId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const nextSortOrder = (maxOrderPlaylist?.sortOrder ?? -1) + 1;

    const playlist = await prisma.playlist.create({
      data: {
        title: data.title,
        youtubeUrl: data.youtubeUrl || null,
        spotifyUrl: data.spotifyUrl || null,
        description: data.description || null,
        sortOrder: nextSortOrder,
        groupId,
        isGlobal: data.isGlobal,
      },
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Playlist creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
