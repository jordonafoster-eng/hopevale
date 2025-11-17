import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { getInitials, getAvatarColor } from '@/lib/utils';

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
    email: string;
    image: string | null;
  };
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const fullStars = Math.floor(recipe.ratingAvg);
  const hasHalfStar = recipe.ratingAvg % 1 >= 0.5;
  const authorName = recipe.author.name || 'Anonymous';
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(recipe.author.email);

  return (
    <Link href={`/recipes/${recipe.id}`} className="card-hover group">
      {/* Content */}
      <div>
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

        <div className="mt-2 flex items-center gap-2">
          {recipe.author.image ? (
            <img
              src={recipe.author.image}
              alt={authorName}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${avatarColor} text-xs font-medium text-white`}
            >
              {initials}
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {authorName}
          </p>
        </div>

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
