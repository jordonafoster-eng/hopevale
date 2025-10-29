'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export function ReflectionFilters({ allTags }: { allTags: string[] }) {
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
    router.push(`/reflections?${params.toString()}`);
  };

  const handleTagFilter = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const currentTag = params.get('tag');

    if (currentTag === tag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }

    router.push(`/reflections?${params.toString()}`);
  };

  const activeTag = searchParams.get('tag');

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
          placeholder="Search reflections..."
          className="input w-full pl-10"
        />
      </form>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by tag:
          </p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-brand-600 text-white dark:bg-brand-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {(searchParams.get('search') || searchParams.get('tag')) && (
        <button
          onClick={() => router.push('/reflections')}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
