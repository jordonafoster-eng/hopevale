import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';
import { PrayerList } from '@/components/prayer/prayer-list';
import { PrayerForm } from '@/components/prayer/prayer-form';
import { PrayerFilters } from '@/components/prayer/prayer-filters';
import { HeartIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Prayer Wall - Community Hub',
  description: 'Share prayer requests and praise reports with the community',
};

async function getPrayers(filters?: {
  type?: 'REQUEST' | 'PRAISE';
  search?: string;
}) {
  const where: any = {
    isApproved: true,
    deletedAt: null,
  };

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { body: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.prayer.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    take: 50, // Limit to 50 most recent
  });
}

async function getUserReactions(userId?: string) {
  if (!userId) return [];

  return prisma.reaction.findMany({
    where: {
      userId,
      targetType: 'prayer',
    },
    select: {
      targetId: true,
      reactionType: true,
    },
  });
}

export default async function PrayerPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: 'REQUEST' | 'PRAISE'; search?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const adminUser = await isAdmin();

  const [prayers, userReactions] = await Promise.all([
    getPrayers({
      type: params.type,
      search: params.search,
    }),
    session?.user ? getUserReactions(session.user.id) : [],
  ]);

  const userReactionMap = new Map(
    userReactions.map((r) => [r.targetId, r.reactionType])
  );

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100 dark:bg-accent-900">
            <HeartIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
          </div>
          <h1 className="mt-4 heading-2">Prayer Wall</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share your prayer requests and praise reports with our community
          </p>
        </div>

        {/* Prayer Form */}
        {session?.user && (
          <div className="mt-8">
            <PrayerForm userId={session.user.id} />
          </div>
        )}

        {!session?.user && (
          <div className="card mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please{' '}
              <a
                href="/auth/signin?callbackUrl=/prayer"
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                sign in
              </a>{' '}
              to share prayer requests or praise reports
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8">
          <PrayerFilters />
        </div>

        {/* Prayer List */}
        <div className="mt-6">
          {prayers.length === 0 ? (
            <div className="card text-center">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No prayers found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {params.search
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share a prayer request or praise report!'}
              </p>
            </div>
          ) : (
            <PrayerList
              prayers={prayers}
              userReactions={userReactionMap}
              currentUserId={session?.user?.id}
              isAdmin={adminUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}
