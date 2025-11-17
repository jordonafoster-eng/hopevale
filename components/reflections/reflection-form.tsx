'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const reflectionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  body: z.string().min(50, 'Please share more details (at least 50 characters)').max(2000),
  tags: z.string(),
});

type ReflectionFormData = z.infer<typeof reflectionSchema>;

const COMMON_TAGS = [
  'faith',
  'grace',
  'prayer',
  'worship',
  'trust',
  'growth',
  'perseverance',
  'love',
  'hope',
  'peace',
  'joy',
  'forgiveness',
  'scripture',
  'testimony',
];

export function ReflectionForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReflectionFormData>({
    resolver: zodResolver(reflectionSchema),
  });

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      setSelectedTags([...selectedTags, normalizedTag]);
    }
    setCustomTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: ReflectionFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          body: data.body,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to submit reflection');
        return;
      }

      const result = await response.json();
      toast.success(result.message || 'Reflection submitted successfully!');
      reset();
      setSelectedTags([]);
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
        Share a Reflection
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Share Your Reflection
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
            placeholder="What has God been teaching you?"
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
            Your Reflection
          </label>
          <textarea
            {...register('body')}
            id="body"
            rows={6}
            className="input mt-1"
            placeholder="Share your thoughts, insights, and what God has revealed to you..."
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.body.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags (optional)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  selectedTags.includes(tag)
                    ? handleRemoveTag(tag)
                    : handleAddTag(tag)
                }
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-600 text-white dark:bg-brand-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(customTag);
                }
              }}
              placeholder="Add custom tag..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => handleAddTag(customTag)}
              className="btn-secondary"
            >
              Add
            </button>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-brand-900 dark:hover:text-brand-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? (
            <>
              <span className="spinner mr-2"></span>
              Submitting...
            </>
          ) : (
            'Share Reflection'
          )}
        </button>
      </form>
    </div>
  );
}
