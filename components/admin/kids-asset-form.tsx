'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';

export function KidsAssetForm() {
  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
      <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
        File Upload Coming Soon
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        The ability to upload PDFs and images directly will be available in the next update.
        For now, you can add assets manually through the Supabase dashboard.
      </p>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
        <strong>Temporary workaround:</strong><br />
        1. Upload files to Supabase Storage (storage.supabase.com)<br />
        2. Get the public URL<br />
        3. Add the asset to the database using Prisma Studio or SQL Editor
      </p>
    </div>
  );
}
