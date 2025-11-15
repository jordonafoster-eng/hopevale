import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { RecipeFilters } from '@/components/recipes/recipe-filters';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Recipes - Church Friends',
  description: 'Share and discover recipes from our community',
};

async function getRecipes(filters?: {
  search?: string;
  category?: string;
  potluckHit?: boolean;
}) {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { ingredients: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.category) {
    where.categories = {
      has: filters.category,
    };
  }

  if (filters?.potluckHit) {
    where.isPotluckHit = true;
  }

  return prisma.recipe.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    take: 50,
  });
}

async function getAllCategories() {
  const recipes = await prisma.recipe.findMany({
    select: {
      categories: true,
    },
  });

  const categorySet = new Set<string>();
  recipes.forEach((r) => {
    r.categories.forEach((cat) => categorySet.add(cat));
  });

  return Array.from(categorySet).sort();
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; potluckHit?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  const [recipes, allCategories] = await Promise.all([
    getRecipes({
      search: params.search,
      category: params.category,
      potluckHit: params.potluckHit === 'true',
    }),
    getAllCategories(),
  ]);

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
            <SparklesIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="mt-4 heading-2">Community Recipes</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share your favorite recipes and discover new ones
          </p>
        </div>

        {/* Recipe Form */}
        {session?.user && (
          <div className="mt-8">
            <RecipeForm userId={session.user.id} />
          </div>
        )}

        {!session?.user && (
          <div className="card mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please{' '}
              <a
                href="/auth/signin?callbackUrl=/recipes"
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                sign in
              </a>{' '}
              to share your recipes
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8">
          <RecipeFilters allCategories={allCategories} />
        </div>

        {/* Recipe Grid */}
        <div className="mt-6">
          {recipes.length === 0 ? (
            <div className="card text-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No recipes found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {params.search || params.category
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share a recipe!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
