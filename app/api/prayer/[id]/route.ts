import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the prayer
    const prayer = await prisma.prayer.findUnique({
      where: { id: params.id },
      select: {
        authorId: true,
      },
    });

    if (!prayer) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }

    // Check if user is author or admin
    const isAuthor = prayer.authorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete (set deletedAt)
    await prisma.prayer.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Prayer deleted successfully' });
  } catch (error) {
    console.error('Prayer deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
