'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const recipeSchema = z.object({
  title: z.string().min(3).max(100),
  ingredients: z.string().min(10).max(2000),
  steps: z.string().min(10).max(2000),
  isPotluckHit: z.boolean(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const COMMON_CATEGORIES = [
  'appetizer',
  'main-dish',
  'side-dish',
  'dessert',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'beverage',
  'salad',
  'soup',
  'bread',
  'vegetarian',
  'vegan',
  'gluten-free',
];

export function RecipeForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      isPotluckHit: false,
    },
  });

  const handleAddCategory = (category: string) => {
    const normalized = category.toLowerCase().trim();
    if (normalized && !selectedCategories.includes(normalized)) {
      setSelectedCategories([...selectedCategories, normalized]);
    }
    setCustomCategory('');
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  const onSubmit = async (data: RecipeFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categories: selectedCategories,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to submit recipe');
        return;
      }

      toast.success('Recipe submitted successfully!');
      reset();
      setSelectedCategories([]);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary w-full">
        Share a Recipe
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Share Your Recipe
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipe Title
          </label>
          <input {...register('title')} type="text" id="title" className="input mt-1" placeholder="Grandma's Chocolate Chip Cookies" />
          {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ingredients
          </label>
          <textarea {...register('ingredients')} id="ingredients" rows={6} className="input mt-1" placeholder="2 cups flour&#10;1 cup sugar&#10;..." />
          {errors.ingredients && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ingredients.message}</p>}
        </div>

        <div>
          <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Instructions
          </label>
          <textarea {...register('steps')} id="steps" rows={6} className="input mt-1" placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients..." />
          {errors.steps && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.steps.message}</p>}
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectedCategories.includes(cat) ? handleRemoveCategory(cat) : handleAddCategory(cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedCategories.includes(cat) ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory(customCategory);
                }
              }}
              placeholder="Add custom category..."
              className="input flex-1"
            />
            <button type="button" onClick={() => handleAddCategory(customCategory)} className="btn-secondary">Add</button>
          </div>

          {selectedCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {cat}
                  <button type="button" onClick={() => handleRemoveCategory(cat)}><XMarkIcon className="h-4 w-4" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <input {...register('isPotluckHit')} type="checkbox" id="isPotluckHit" className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <label htmlFor="isPotluckHit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mark as a potluck hit</label>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <><span className="spinner mr-2"></span>Submitting...</> : 'Share Recipe'}
        </button>
      </form>
    </div>
  );
}
