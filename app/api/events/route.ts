import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/email';
import { formatDateTime } from '@/lib/utils';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  location: z.string().optional(),
  isPotluck: z.boolean().default(false),
  capacity: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        location: data.location || null,
        isPotluck: data.isPotluck,
        capacity: data.capacity || null,
        tags: data.tags,
        isPublished: data.isPublished,
        createdById: session.user.id,
      },
    });

    // Send notifications to all users about the new event (if published)
    if (event.isPublished) {
      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });

      const eventTime = event.startAt
        ? formatDateTime(event.startAt)
        : 'Date and time TBD';

      const eventLocation = event.location
        ? ` Location: ${event.location}.`
        : '';

      // Send notification to each user (they can be filtered by preferences in createNotification)
      await Promise.allSettled(
        users.map((user) =>
          createNotification({
            userId: user.id,
            type: 'NEW_EVENT',
            title: `New Event: ${event.title}`,
            message: `A new event has been created. ${eventTime}.${eventLocation}`,
            link: `/events/${event.id}`,
          })
        )
      );
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
