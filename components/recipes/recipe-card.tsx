import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

type Recipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  categories: string[];
  isPotluckHit: boolean;
  ratingAvg: number;
  ratingCount: number;
  author: {
    name: string | null;
  };
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const fullStars = Math.floor(recipe.ratingAvg);
  const hasHalfStar = recipe.ratingAvg % 1 >= 0.5;

  return (
    <Link href={`/recipes/${recipe.id}`} className="card-hover group">
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <SparklesIcon className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
            {recipe.title}
          </h3>
          {recipe.isPotluckHit && (
            <span className="badge flex-shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Potluck Hit!
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          By {recipe.author.name || 'Anonymous'}
        </p>

        {/* Rating */}
        {recipe.ratingCount > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                if (i < fullStars) {
                  return (
                    <StarIcon
                      key={i}
                      className="h-4 w-4 text-yellow-400"
                    />
                  );
                } else if (i === fullStars && hasHalfStar) {
                  return (
                    <div key={i} className="relative">
                      <StarOutlineIcon className="h-4 w-4 text-yellow-400" />
                      <StarIcon
                        className="absolute inset-0 h-4 w-4 text-yellow-400"
                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                      />
                    </div>
                  );
                } else {
                  return (
                    <StarOutlineIcon
                      key={i}
                      className="h-4 w-4 text-gray-300 dark:text-gray-600"
                    />
                  );
                }
              })}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {recipe.ratingAvg.toFixed(1)} ({recipe.ratingCount})
            </span>
          </div>
        )}

        {/* Categories */}
        {recipe.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="badge-secondary text-xs"
              >
                {cat}
              </span>
            ))}
            {recipe.categories.length > 3 && (
              <span className="badge-secondary text-xs">
                +{recipe.categories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function SparklesIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
