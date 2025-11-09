import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import {
  CalendarIcon,
  HeartIcon,
  BookOpenIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: {
      startAt: {
        gte: new Date(),
      },
      isPublished: true,
    },
    orderBy: {
      startAt: 'asc',
    },
    take: 3,
    include: {
      _count: {
        select: { rsvps: true },
      },
    },
  });
}

async function getLatestPrayer() {
  return prisma.prayer.findFirst({
    where: {
      isApproved: true,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getLatestReflection() {
  return prisma.reflection.findFirst({
    where: {
      isApproved: true,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
}

export default async function HomePage() {
  const [events, latestPrayer, latestReflection] = await Promise.all([
    getUpcomingEvents(),
    getLatestPrayer(),
    getLatestReflection(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-accent-600 py-20 text-white">
        <div className="section">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-1 text-white">
              Welcome to Group Life
            </h1>
            <p className="mt-6 text-xl text-brand-50">
              Building faith, fellowship, and community together. Join us for
              worship, prayer, and meaningful connections.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/events" className="btn inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl">
                View Events
              </Link>
              <Link href="/prayer" className="btn inline-flex items-center justify-center rounded-lg border-2 border-white bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-xl">
                Prayer Wall
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/events"
            className="card-hover group flex flex-col items-center p-8 text-center"
          >
            <CalendarIcon className="h-12 w-12 text-brand-600 transition-transform group-hover:scale-110 dark:text-brand-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Events
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join us for worship and fellowship
            </p>
          </Link>

          <Link
            href="/prayer"
            className="card-hover group flex flex-col items-center p-8 text-center"
          >
            <HeartIcon className="h-12 w-12 text-accent-600 transition-transform group-hover:scale-110 dark:text-accent-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Prayer
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Share requests and praise reports
            </p>
          </Link>

          <Link
            href="/reflections"
            className="card-hover group flex flex-col items-center p-8 text-center"
          >
            <BookOpenIcon className="h-12 w-12 text-green-600 transition-transform group-hover:scale-110 dark:text-green-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Reflections
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              What God is teaching us
            </p>
          </Link>

          <Link
            href="/music"
            className="card-hover group flex flex-col items-center p-8 text-center"
          >
            <MusicalNoteIcon className="h-12 w-12 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Music
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Worship songs and playlists
            </p>
          </Link>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section bg-gray-50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <h2 className="heading-2">Upcoming Events</h2>
            <Link
              href="/events"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View All
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {events.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No upcoming events at this time.
              </p>
            ) : (
              events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="card-hover flex items-start gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400">
                      <span className="text-xs font-semibold uppercase">
                        {new Date(event.startAt).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </span>
                      <span className="text-2xl font-bold">
                        {new Date(event.startAt).getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(event.startAt)}
                    </p>
                    {event.location && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {event.location}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{event._count.rsvps} RSVPs</span>
                      {event.isPotluck && (
                        <span className="badge-primary">Potluck</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Prayer & Reflection */}
      <section className="section">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Latest Prayer */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="heading-3">Latest Prayer</h2>
              <Link
                href="/prayer"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View All
              </Link>
            </div>
            {latestPrayer ? (
              <div className="card mt-4">
                <span
                  className={`badge ${
                    latestPrayer.type === 'PRAISE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {latestPrayer.type === 'PRAISE' ? 'Praise' : 'Request'}
                </span>
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                  {latestPrayer.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                  {latestPrayer.body}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <HeartIcon className="h-4 w-4" />
                  <span>{latestPrayer.reactionsCount} prayed</span>
                </div>
              </div>
            ) : (
              <p className="card mt-4 text-center text-gray-600 dark:text-gray-400">
                No prayers yet. Be the first to share!
              </p>
            )}
          </div>

          {/* Latest Reflection */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="heading-3">Latest Reflection</h2>
              <Link
                href="/reflections"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View All
              </Link>
            </div>
            {latestReflection ? (
              <div className="card mt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {latestReflection.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                  {latestReflection.body}
                </p>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  By {latestReflection.author.name}
                </div>
              </div>
            ) : (
              <p className="card mt-4 text-center text-gray-600 dark:text-gray-400">
                No reflections yet. Share what God is teaching you!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
