'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const prayerSchema = z.object({
  type: z.literal('REQUEST'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().min(10, 'Please provide more details').max(1000),
  isAnonymous: z.boolean(),
});

type PrayerFormData = z.infer<typeof prayerSchema>;

export function PrayerForm({ userId: _userId }: { userId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrayerFormData>({
    resolver: zodResolver(prayerSchema),
    defaultValues: {
      type: 'REQUEST',
      isAnonymous: false,
    },
  });

  const onSubmit = async (data: PrayerFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to submit prayer');
        return;
      }

      const result = await response.json();
      toast.success(result.message || 'Prayer submitted successfully!');
      reset();
      setIsOpen(false);
      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary w-full">
        Share a Prayer Request
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Share Prayer Request
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <input type="hidden" {...register('type')} value="REQUEST" />

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="input mt-1"
            placeholder="Brief summary..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Body */}
        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Details
          </label>
          <textarea
            {...register('body')}
            id="body"
            rows={4}
            className="input mt-1"
            placeholder="Share more details..."
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.body.message}
            </p>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center">
          <input
            {...register('isAnonymous')}
            type="checkbox"
            id="isAnonymous"
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <label
            htmlFor="isAnonymous"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Post anonymously
          </label>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? (
            <>
              <span className="spinner mr-2"></span>
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}
