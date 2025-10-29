import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { KidsAssetCard } from '@/components/kids/kids-asset-card';
import { KidsFilters } from '@/components/kids/kids-filters';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Kids Corner - Community Hub',
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
  searchParams: { type?: 'VERSE' | 'ACTIVITY' | 'COLORING'; search?: string };
}) {
  const assets = await getKidsAssets({
    type: searchParams.type,
    search: searchParams.search,
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

        {/* Assets Grid */}
        <div className="mt-6">
          {assets.length === 0 ? (
            <div className="card text-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No resources found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {searchParams.search || searchParams.type
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new resources!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
