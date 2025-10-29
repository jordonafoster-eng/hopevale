'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export function EventFilters() {
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
    router.push(`/events?${params.toString()}`);
  };

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    const currentFilter = params.get('filter');

    if (currentFilter === filter) {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }

    router.push(`/events?${params.toString()}`);
  };

  const activeFilter = searchParams.get('filter');

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
          placeholder="Search events..."
          className="input w-full pl-10"
        />
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('upcoming')}
          className={`btn-secondary ${
            activeFilter === 'upcoming'
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
              : ''
          }`}
        >
          Upcoming Only
        </button>
        <button
          onClick={() => handleFilterChange('potluck')}
          className={`btn-secondary ${
            activeFilter === 'potluck'
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
              : ''
          }`}
        >
          Potlucks
        </button>
        {(searchParams.get('search') || searchParams.get('filter')) && (
          <button
            onClick={() => router.push('/events')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
