import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canViewGroupContent } from '@/lib/auth-utils';
import { sendCommentNotifications } from '@/lib/comment-notifications';

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: prayerId } = await params;

    // Verify prayer exists and get owner info
    const prayer = await prisma.prayer.findUnique({
      where: { id: prayerId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!prayer || !(await canViewGroupContent(prayer.groupId))) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        body: validatedData.body,
        authorId: session.user.id,
        prayerId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Fire-and-forget notifications
    const commentAuthorName = session.user.name || session.user.email || 'Someone';
    sendCommentNotifications({
      commentId: comment.id,
      commentBody: validatedData.body,
      commentAuthorId: session.user.id,
      commentAuthorName,
      contentType: 'prayer',
      contentTitle: prayer.isAnonymous ? 'Prayer Request' : prayer.title,
      contentLink: `/prayer`,
      contentOwnerId: prayer.authorId ?? null,
    }).catch((err) => console.error('Comment notification error:', err));

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: prayerId } = await params;

    const comments = await prisma.comment.findMany({
      where: { prayerId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
