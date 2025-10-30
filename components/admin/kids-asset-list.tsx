'use client';

import { TrashIcon } from '@heroicons/react/24/outline';

type KidsAsset = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  createdAt: Date;
  downloadCount: number;
};

export function KidsAssetList({ assets }: { assets: KidsAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="card mt-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No assets yet. Add your first one above!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <div key={asset.id} className="card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {asset.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Type: {asset.type}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Downloads: {asset.downloadCount}
              </p>
            </div>
            <button
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              title="Delete (coming soon)"
              disabled
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View File →
          </a>
        </div>
      ))}
    </div>
  );
}
