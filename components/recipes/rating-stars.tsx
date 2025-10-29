import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

export function RatingStars({ rating, count, size = 'md' }: { rating: number; count?: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < full) return <StarIcon key={i} className={`${sizeClass} text-yellow-400`} />;
          if (i === full && hasHalf) return (
            <div key={i} className="relative">
              <StarOutlineIcon className={`${sizeClass} text-yellow-400`} />
              <StarIcon className={`absolute inset-0 ${sizeClass} text-yellow-400`} style={{ clipPath: 'inset(0 50% 0 0)' }} />
            </div>
          );
          return <StarOutlineIcon key={i} className={`${sizeClass} text-gray-300 dark:text-gray-600`} />;
        })}
      </div>
      {count !== undefined && <span className="text-sm text-gray-600 dark:text-gray-400">{rating.toFixed(1)} ({count})</span>}
    </div>
  );
}
