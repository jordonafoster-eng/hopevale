import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import { RSVPForm } from '@/components/events/rsvp-form';
import { RSVPList } from '@/components/events/rsvp-list';
import { EventAdminActions } from '@/components/admin/event-admin-actions';
import { EventActions } from '@/components/events/event-actions';
import { ShareEventButton } from '@/components/events/share-event-button';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: `${event.title} - Group Life`,
    description: event.description || `Join us for ${event.title}`,
  };
}

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      rsvps: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!event) return null;

  const totalAttendees = event.rsvps.reduce(
    (sum, rsvp) => sum + rsvp.adults + rsvp.kids,
    0
  );

  return {
    ...event,
    totalAttendees,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, session] = await Promise.all([
    getEvent(id),
    auth(),
  ]);

  if (!event) {
    notFound();
  }

  const userRSVP = session?.user
    ? event.rsvps.find((rsvp) => rsvp.user.id === session.user.id)
    : null;

  const spotsLeft = event.capacity
    ? event.capacity - event.totalAttendees
    : null;

  const isPast = event.startAt ? new Date(event.startAt) < new Date() : false;

  return (
    <div className="section">
      <Link
        href="/events"
        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            {isPast && (
              <div className="mb-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                This event has passed
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="heading-2">{event.title}</h1>
                {event.createdBy?.name && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Organized by {event.createdBy.name}
                  </p>
                )}
              </div>
              {event.isPotluck && (
                <span className="badge-primary flex-shrink-0">Potluck</span>
              )}
            </div>

            {/* Event Actions */}
            {session?.user && (session.user.role === 'ADMIN' || event.createdById === session.user.id) && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                {session.user.role === 'ADMIN' ? (
                  <EventAdminActions eventId={event.id} />
                ) : (
                  <EventActions eventId={event.id} />
                )}
              </div>
            )}

            {/* Event Details */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(event.startAt)}
                  </p>
                  {event.endAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ends {formatDateTime(event.endAt)}
                    </p>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">
                    {event.location}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <UserGroupIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-gray-900 dark:text-white">
                    {event.rsvps.length} RSVP{event.rsvps.length !== 1 ? 's' : ''} ({event.totalAttendees} total attendees)
                  </p>
                  {spotsLeft !== null && (
                    <p
                      className={`text-sm ${
                        spotsLeft <= 10
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {spotsLeft > 0
                        ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining`
                        : 'Event is full'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  About
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              </div>
            )}

            {/* RSVPs */}
            {event.rsvps.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Who&apos;s Coming
                </h2>
                <RSVPList rsvps={event.rsvps} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          {!isPast && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {userRSVP ? 'Update Your RSVP' : 'RSVP to Event'}
              </h3>

              {!session?.user ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please sign in to RSVP to this event
                  </p>
                  <Link
                    href={`/auth/signin?callbackUrl=/events/${event.id}`}
                    className="btn-primary mt-4 block text-center"
                  >
                    Sign In
                  </Link>
                </div>
              ) : spotsLeft !== null && spotsLeft <= 0 && !userRSVP ? (
                <div className="mt-4 rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                  <p className="text-sm text-orange-800 dark:text-orange-400">
                    This event is at capacity. You can still RSVP to be added to
                    the waitlist.
                  </p>
                </div>
              ) : null}

              {session?.user && (
                <div className="mt-4">
                  <RSVPForm
                    eventId={event.id}
                    existingRSVP={userRSVP}
                    userId={session.user.id}
                  />
                </div>
              )}
            </div>
          )}

          {/* Share Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Event
            </h3>
            <ShareEventButton />
          </div>
        </div>
      </div>
    </div>
  );
}
