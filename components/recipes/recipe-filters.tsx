'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export function RecipeFilters({ allCategories }: { allCategories: string[] }) {
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
    router.push(`/recipes?${params.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get('category');
    if (current === category) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/recipes?${params.toString()}`);
  };

  const handlePotluckFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (params.get('potluckHit') === 'true') {
      params.delete('potluckHit');
    } else {
      params.set('potluckHit', 'true');
    }
    router.push(`/recipes?${params.toString()}`);
  };

  const activeCategory = searchParams.get('category');
  const showPotluckHits = searchParams.get('potluckHit') === 'true';

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes..." className="input w-full pl-10" />
      </form>

      <div className="flex flex-wrap gap-2">
        <button onClick={handlePotluckFilter} className={`btn-secondary ${showPotluckHits ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : ''}`}>
          Potluck Hits
        </button>
        {allCategories.slice(0, 8).map((cat) => (
          <button key={cat} onClick={() => handleCategoryFilter(cat)} className={`btn-secondary ${activeCategory === cat ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : ''}`}>
            {cat}
          </button>
        ))}
        {(searchParams.get('search') || searchParams.get('category') || searchParams.get('potluckHit')) && (
          <button onClick={() => router.push('/recipes')} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear all</button>
        )}
      </div>
    </div>
  );
}
