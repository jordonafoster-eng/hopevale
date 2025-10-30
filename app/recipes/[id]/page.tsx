import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { RatingStars } from '@/components/recipes/rating-stars';
import { RatingForm } from '@/components/recipes/rating-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: recipe ? `${recipe.title} - Recipes` : 'Recipe Not Found' };
}

async function getRecipe(id: string) {
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      ratings: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [recipe, session] = await Promise.all([getRecipe(id), auth()]);
  if (!recipe) notFound();

  const userRating = session?.user ? recipe.ratings.find((r) => r.userId === session.user.id) : null;

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        <Link href="/recipes" className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />Back to Recipes
        </Link>

        <article className="card mt-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="heading-2">{recipe.title}</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">By {recipe.author.name || 'Anonymous'}</p>
            </div>
            {recipe.isPotluckHit && <span className="badge bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Potluck Hit!</span>}
          </div>

          {recipe.ratingCount > 0 && (
            <div className="mt-4">
              <RatingStars rating={recipe.ratingAvg} count={recipe.ratingCount} />
            </div>
          )}

          {recipe.imageUrl && (
            <img src={recipe.imageUrl} alt={recipe.title} className="mt-6 w-full rounded-lg object-cover" style={{maxHeight: '400px'}} />
          )}

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ingredients</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{recipe.ingredients}</pre>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Instructions</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{recipe.steps}</pre>
            </div>

            {recipe.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recipe.categories.map((cat) => (
                    <Link key={cat} href={`/recipes?category=${cat}`} className="badge-secondary hover:bg-brand-100 dark:hover:bg-brand-900">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {session?.user && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{userRating ? 'Update Your Rating' : 'Rate This Recipe'}</h3>
            <RatingForm recipeId={recipe.id} existingRating={userRating} />
          </div>
        )}

        {recipe.ratings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews ({recipe.ratings.length})</h3>
            <div className="mt-4 space-y-4">
              {recipe.ratings.map((rating) => (
                <div key={rating.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{rating.user.name || 'Anonymous'}</p>
                      <RatingStars rating={rating.rating} size="sm" />
                    </div>
                  </div>
                  {rating.comment && <p className="mt-2 text-gray-700 dark:text-gray-300">{rating.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
