'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

type KidsAsset = {
  id: string;
  title: string;
  description: string | null;
  type: 'VERSE' | 'ACTIVITY' | 'COLORING';
  fileUrl: string;
  thumbnailUrl: string | null;
  tags: string[];
  downloadCount: number;
};

const typeColors = {
  VERSE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACTIVITY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  COLORING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const typeLabels = {
  VERSE: 'Memory Verse',
  ACTIVITY: 'Activity',
  COLORING: 'Coloring Page',
};

export function KidsAssetCard({ asset }: { asset: KidsAsset }) {
  const handleDownload = async () => {
    // Open file in new tab
    window.open(asset.fileUrl, '_blank');

    // Increment download count
    await fetch(`/api/kids/${asset.id}/download`, {
      method: 'POST',
    }).catch(() => {
      // Ignore errors for download tracking
    });
  };

  return (
    <div className="card-hover">
      {/* Thumbnail */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`badge flex-shrink-0 ${typeColors[asset.type]}`}>
            {typeLabels[asset.type]}
          </span>
        </div>

        <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
          {asset.title}
        </h3>

        {asset.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {asset.description}
          </p>
        )}

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge-secondary text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="btn-primary mt-4 w-full"
        >
          <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
          Download PDF
        </button>

        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          {asset.downloadCount} downloads
        </p>
      </div>
    </div>
  );
}
