import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const rsvpSchema = z.object({
  adults: z.number().min(0).max(20),
  kids: z.number().min(0).max(20),
  note: z.string().optional(),
});

// Create or update RSVP
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = rsvpSchema.parse(body);

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        rsvps: {
          select: {
            adults: true,
            kids: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event is in the past
    if (new Date(event.startAt) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot RSVP to past events' },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity) {
      const currentAttendees = event.rsvps.reduce(
        (sum, rsvp) => sum + rsvp.adults + rsvp.kids,
        0
      );
      const newAttendees = validatedData.adults + validatedData.kids;

      if (currentAttendees + newAttendees > event.capacity) {
        return NextResponse.json(
          {
            error: `Event capacity exceeded. Only ${event.capacity - currentAttendees} spots remaining.`,
          },
          { status: 400 }
        );
      }
    }

    // Create RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: params.id,
        userId: session.user.id,
        adults: validatedData.adults,
        kids: validatedData.kids,
        note: validatedData.note || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('RSVP creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update RSVP
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = rsvpSchema.parse(body);

    // Find existing RSVP
    const existingRSVP = await prisma.rSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (!existingRSVP) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    // Check event capacity
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        rsvps: {
          where: {
            userId: {
              not: session.user.id, // Exclude current user's RSVP
            },
          },
          select: {
            adults: true,
            kids: true,
          },
        },
      },
    });

    if (event?.capacity) {
      const otherAttendees = event.rsvps.reduce(
        (sum, rsvp) => sum + rsvp.adults + rsvp.kids,
        0
      );
      const newAttendees = validatedData.adults + validatedData.kids;

      if (otherAttendees + newAttendees > event.capacity) {
        return NextResponse.json(
          {
            error: `Event capacity exceeded. Only ${event.capacity - otherAttendees} spots remaining.`,
          },
          { status: 400 }
        );
      }
    }

    // Update RSVP
    const rsvp = await prisma.rSVP.update({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
      data: {
        adults: validatedData.adults,
        kids: validatedData.kids,
        note: validatedData.note || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('RSVP update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete RSVP
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

    // Delete RSVP
    await prisma.rSVP.delete({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('RSVP deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
