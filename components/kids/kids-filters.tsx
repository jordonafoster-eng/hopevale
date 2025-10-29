'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export function KidsFilters() {
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
    router.push(`/kids?${params.toString()}`);
  };

  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams);
    const currentType = params.get('type');
    if (currentType === type) {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.push(`/kids?${params.toString()}`);
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
          placeholder="Search resources..."
          className="input w-full pl-10"
        />
      </form>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTypeFilter('VERSE')}
          className={`btn-secondary ${
            activeType === 'VERSE'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : ''
          }`}
        >
          Memory Verses
        </button>
        <button
          onClick={() => handleTypeFilter('ACTIVITY')}
          className={`btn-secondary ${
            activeType === 'ACTIVITY'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : ''
          }`}
        >
          Activities
        </button>
        <button
          onClick={() => handleTypeFilter('COLORING')}
          className={`btn-secondary ${
            activeType === 'COLORING'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : ''
          }`}
        >
          Coloring Pages
        </button>
        {(searchParams.get('search') || searchParams.get('type')) && (
          <button
            onClick={() => router.push('/kids')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
