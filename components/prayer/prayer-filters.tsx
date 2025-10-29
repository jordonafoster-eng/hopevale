'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export function PrayerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/prayer?${params.toString()}`);
  };

  const handleTypeFilter = (type: 'REQUEST' | 'PRAISE') => {
    const params = new URLSearchParams(searchParams);
    const currentType = params.get('type');

    if (currentType === type) {
      params.delete('type');
    } else {
      params.set('type', type);
    }

    router.push(`/prayer?${params.toString()}`);
  };

  const activeType = searchParams.get('type');

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prayers..."
          className="input w-full pl-10"
        />
      </form>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTypeFilter('REQUEST')}
          className={`btn-secondary ${
            activeType === 'REQUEST'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : ''
          }`}
        >
          Prayer Requests
        </button>
        <button
          onClick={() => handleTypeFilter('PRAISE')}
          className={`btn-secondary ${
            activeType === 'PRAISE'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : ''
          }`}
        >
          Praise Reports
        </button>
        {(searchParams.get('search') || searchParams.get('type')) && (
          <button
            onClick={() => router.push('/prayer')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
