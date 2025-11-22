'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const editRecipeSchema = z.object({
  title: z.string().min(3).max(100),
  ingredients: z.string().min(10).max(2000),
  steps: z.string().min(10).max(2000),
  isPotluckHit: z.boolean(),
});

type EditRecipeFormData = z.infer<typeof editRecipeSchema>;

type Recipe = {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  categories: string[];
  isPotluckHit: boolean;
};

export function RecipeActions({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditRecipeFormData>({
    resolver: zodResolver(editRecipeSchema),
    defaultValues: {
      title: recipe.title,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      isPotluckHit: recipe.isPotluckHit,
    },
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete');
        return;
      }

      toast.success('Recipe deleted successfully');
      router.push('/recipes');
      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (data: EditRecipeFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categories: recipe.categories, // Keep existing categories
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to update');
        return;
      }

      toast.success('Recipe updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Recipe
          </h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipe Title
            </label>
            <input
              {...register('title')}
              type="text"
              id="edit-title"
              className="input mt-1"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ingredients
            </label>
            <textarea
              {...register('ingredients')}
              id="edit-ingredients"
              rows={6}
              className="input mt-1"
            />
            {errors.ingredients && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ingredients.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instructions
            </label>
            <textarea
              {...register('steps')}
              id="edit-steps"
              rows={6}
              className="input mt-1"
            />
            {errors.steps && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.steps.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('isPotluckHit')}
              type="checkbox"
              id="edit-isPotluckHit"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="edit-isPotluckHit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Mark as a potluck hit
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <PencilIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <TrashIcon className="h-4 w-4" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
