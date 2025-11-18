import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import { EventCalendar } from '@/components/events/event-calendar';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Events - Church Friends',
  description: 'Browse and RSVP to community events',
};

async function getEvents(filters?: {
  search?: string;
  upcoming?: boolean;
  potluck?: boolean;
}) {
  const where: any = {
    isPublished: true,
  };

  if (filters?.upcoming) {
    where.startAt = {
      gte: new Date(),
    };
  }

  if (filters?.potluck) {
    where.isPotluck = true;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: {
      startAt: 'asc',
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
      rsvps: {
        select: {
          adults: true,
          kids: true,
        },
      },
    },
  });

  // Calculate total attendees
  return events.map((event) => ({
    ...event,
    totalAttendees: event.rsvps.reduce(
      (sum, rsvp) => sum + rsvp.adults + rsvp.kids,
      0
    ),
  }));
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; view?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const filters = {
    search: params.search,
    upcoming: params.filter === 'upcoming',
    potluck: params.filter === 'potluck',
  };

  const events = await getEvents(filters);
  const now = new Date();
  const upcomingEvents = events.filter((e) => !e.startAt || new Date(e.startAt) >= now);
  const pastEvents = events.filter((e) => e.startAt && new Date(e.startAt) < now);

  return (
    <div className="section">
      <div className="page-header flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="heading-2">Events</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join us for worship, fellowship, and community gatherings
          </p>
        </div>
        {session?.user && (
          <Link href="/events/new" className="btn-primary">
            <PlusIcon className="mr-2 h-5 w-5" />
            Create Event
          </Link>
        )}
      </div>

      <div className="mt-8">
        <EventFilters />
      </div>

      {/* View Toggle */}
      <div className="mt-6 flex gap-2">
        <Link
          href="/events?view=list"
          className={`btn-secondary ${
            params.view !== 'calendar' ? 'bg-brand-50 dark:bg-brand-950' : ''
          }`}
        >
          List View
        </Link>
        <Link
          href="/events?view=calendar"
          className={`btn-secondary ${
            params.view === 'calendar' ? 'bg-brand-50 dark:bg-brand-950' : ''
          }`}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          Calendar View
        </Link>
      </div>

      {/* Events List */}
      {params.view === 'calendar' ? (
        <EventCalendar events={events} />
      ) : (
        <>
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="mt-8">
              <h2 className="heading-3">Upcoming Events</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="mt-12">
              <h2 className="heading-3">Past Events</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} isPast />
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="card mt-8 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No events found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {filters.search
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for upcoming events!'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
