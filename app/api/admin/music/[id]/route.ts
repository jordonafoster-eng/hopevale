import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canManageGroupContent, isSuperAdmin } from '@/lib/auth-utils';

const updatePlaylistSchema = z.object({
  title: z.string().min(1).optional(),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  spotifyUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  isGlobal: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.playlist.findUnique({
      where: { id: params.id },
      select: { groupId: true, isGlobal: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Admins can only change their own group's content; shared items are SUPER_ADMIN-only
    if (!(await canManageGroupContent(existing.groupId, existing.isGlobal))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updatePlaylistSchema.parse(body);

    if (data.isGlobal !== undefined && !(await isSuperAdmin())) {
      return NextResponse.json(
        { error: 'Only super admins can share content with all groups' },
        { status: 403 }
      );
    }

    // Only update fields that were sent (blank strings clear a field)
    const playlist = await prisma.playlist.update({
      where: { id: params.id },
      data: {
        title: data.title,
        youtubeUrl: data.youtubeUrl === undefined ? undefined : data.youtubeUrl || null,
        spotifyUrl: data.spotifyUrl === undefined ? undefined : data.spotifyUrl || null,
        description: data.description === undefined ? undefined : data.description || null,
        isGlobal: data.isGlobal,
      },
    });

    return NextResponse.json(playlist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Playlist update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.playlist.findUnique({
      where: { id: params.id },
      select: { groupId: true, isGlobal: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Admins can only change their own group's content; shared items are SUPER_ADMIN-only
    if (!(await canManageGroupContent(existing.groupId, existing.isGlobal))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.playlist.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Playlist deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
