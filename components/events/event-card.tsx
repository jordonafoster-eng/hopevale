import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

type Event = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  isPotluck: boolean;
  capacity: number | null;
  totalAttendees: number;
  _count: {
    rsvps: number;
  };
};

export function EventCard({
  event,
  isPast = false,
}: {
  event: Event;
  isPast?: boolean;
}) {
  const startDate = event.startAt ? new Date(event.startAt) : null;
  const spotsLeft = event.capacity
    ? event.capacity - event.totalAttendees
    : null;

  return (
    <Link
      href={`/events/${event.id}`}
      className={`card-hover group ${isPast ? 'opacity-75' : ''}`}
    >
      {/* Date Badge */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400">
            {startDate ? (
              <>
                <span className="text-xs font-semibold uppercase">
                  {startDate.toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-2xl font-bold">{startDate.getDate()}</span>
              </>
            ) : (
              <span className="text-xs font-semibold text-center px-1">TBD</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {event.title}
            </h3>
            {event.isPotluck && (
              <span className="badge-primary flex-shrink-0">Potluck</span>
            )}
          </div>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {event.description}
            </p>
          )}

          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.startAt ? formatDateTime(event.startAt) : 'Date and time TBD'}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
                <span>
                  {event._count.rsvps} RSVP{event._count.rsvps !== 1 ? 's' : ''}
                </span>
              </div>

              {spotsLeft !== null && (
                <span
                  className={`text-xs font-medium ${
                    spotsLeft <= 10
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {spotsLeft > 0
                    ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
                    : 'Full'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isPast && (
        <div className="mt-4 rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          Past Event
        </div>
      )}
    </Link>
  );
}
