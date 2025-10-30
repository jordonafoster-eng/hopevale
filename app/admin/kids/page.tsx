import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { KidsAssetForm } from '@/components/admin/kids-asset-form';
import { KidsAssetList } from '@/components/admin/kids-asset-list';

export const metadata: Metadata = {
  title: 'Kids Corner Management - Admin',
  description: 'Manage kids assets',
};

async function getKidsAssets() {
  return prisma.kidsAsset.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function AdminKidsPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect('/');
  }

  const assets = await getKidsAssets();

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="heading-2">Kids Corner Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload and manage verses, activities, and coloring pages
          </p>
        </div>

        {/* Upload Form */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            <PlusIcon className="mr-2 inline-block h-5 w-5" />
            Add New Asset
          </h2>
          <KidsAssetForm />
        </div>

        {/* Assets List */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Existing Assets ({assets.length})
          </h2>
          <KidsAssetList assets={assets} />
        </div>
      </div>
    </div>
  );
}
