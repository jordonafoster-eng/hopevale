import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ReflectionList } from '@/components/reflections/reflection-list';
import { ReflectionForm } from '@/components/reflections/reflection-form';
import { ReflectionFilters } from '@/components/reflections/reflection-filters';
import { BookOpenIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Reflections - Community Hub',
  description: 'Share what God is teaching you',
};

async function getReflections(filters?: {
  search?: string;
  tag?: string;
}) {
  const where: any = {
    isApproved: true,
    deletedAt: null,
  };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { body: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.tag) {
    where.tags = {
      has: filters.tag,
    };
  }

  return prisma.reflection.findMany({
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
    take: 50,
  });
}

async function getAllTags() {
  const reflections = await prisma.reflection.findMany({
    where: {
      isApproved: true,
      deletedAt: null,
    },
    select: {
      tags: true,
    },
  });

  const tagSet = new Set<string>();
  reflections.forEach((r) => {
    r.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

export default async function ReflectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  const [reflections, allTags] = await Promise.all([
    getReflections({
      search: params.search,
      tag: params.tag,
    }),
    getAllTags(),
  ]);

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-4 heading-2">Reflections</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share what God has been teaching you in your journey
          </p>
        </div>

        {/* Reflection Form */}
        {session?.user && (
          <div className="mt-8">
            <ReflectionForm userId={session.user.id} />
          </div>
        )}

        {!session?.user && (
          <div className="card mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please{' '}
              <a
                href="/auth/signin?callbackUrl=/reflections"
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                sign in
              </a>{' '}
              to share your reflections
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8">
          <ReflectionFilters allTags={allTags} />
        </div>

        {/* Reflection List */}
        <div className="mt-6">
          {reflections.length === 0 ? (
            <div className="card text-center">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No reflections found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {params.search || params.tag
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share what God is teaching you!'}
              </p>
            </div>
          ) : (
            <ReflectionList
              reflections={reflections}
              currentUserId={session?.user?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
