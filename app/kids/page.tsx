import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { KidsAssetCard } from '@/components/kids/kids-asset-card';
import { KidsFilters } from '@/components/kids/kids-filters';
import { SparklesIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kids Corner - Church Friends',
  description: 'Memory verses, activities, and coloring pages for kids',
};

async function getKidsAssets(filters?: {
  type?: 'VERSE' | 'ACTIVITY' | 'COLORING';
  search?: string;
}) {
  const where: any = {};

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.kidsAsset.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function KidsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: 'VERSE' | 'ACTIVITY' | 'COLORING'; search?: string }>;
}) {
  const params = await searchParams;
  const assets = await getKidsAssets({
    type: params.type,
    search: params.search,
  });

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
            <SparklesIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="mt-4 heading-2">Kids Corner</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Memory verses, fun activities, and coloring pages for children
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8">
          <KidsFilters />
        </div>

        {/* Resources Grid */}
        <div className="mt-6">
          {assets.length === 0 && (params.search || params.type) ? (
            <div className="card text-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No resources found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Bible Verse Matching Game Card */}
              <Link href="/kids/verse-game" className="card-hover group">
                {/* Game Icon/Thumbnail */}
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-400 to-blue-500">
                  <div className="flex h-full items-center justify-center">
                    <PuzzlePieceIcon className="h-20 w-20 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge flex-shrink-0 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                      Bible Game
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                    Bible Verse Matching Game
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    Match Bible verses with their references in this fun and interactive game! Perfect for kids ages 3-12.
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="badge-secondary text-xs">
                      Interactive
                    </span>
                    <span className="badge-secondary text-xs">
                      Ages 3-12
                    </span>
                    <span className="badge-secondary text-xs">
                      Bible Learning
                    </span>
                  </div>

                  {/* Play Button */}
                  <button className="btn-primary mt-4 w-full bg-purple-600 hover:bg-purple-700">
                    <PuzzlePieceIcon className="mr-2 h-5 w-5" />
                    Play Game
                  </button>
                </div>
              </Link>

              {/* Downloadable Assets */}
              {assets.map((asset) => (
                <KidsAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="card mt-8 bg-yellow-50 dark:bg-yellow-950">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            For Parents & Teachers
          </h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              All materials are free to download and print for personal or church use.
            </p>
            <p>
              Help your children grow in faith with age-appropriate Bible verses,
              activities, and creative coloring pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
