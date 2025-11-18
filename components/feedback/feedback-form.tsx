'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const feedbackSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Please provide more details').max(1000),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const categories = [
  'General Feedback',
  'Website Issue',
  'Feature Request',
  'Event Suggestion',
  'Content Improvement',
  'Other',
];

export function FeedbackForm({ userId }: { userId?: string }) {
  const _router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to submit feedback');
        return;
      }

      setSubmitted(true);
      toast.success('Feedback submitted successfully!');
    } catch (_error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Thank you for your feedback!
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We appreciate you taking the time to help us improve.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-secondary mt-6"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!userId && (
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            You&rsquo;re submitting feedback anonymously. If you&rsquo;d like us to follow up,
            please{' '}
            <a
              href="/auth/signin?callbackUrl=/feedback"
              className="font-medium underline"
            >
              sign in
            </a>
            .
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        <select
          {...register('category')}
          id="category"
          className="input mt-1"
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.category.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Your Feedback
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={6}
          className="input mt-1"
          placeholder="Share your thoughts, suggestions, or report an issue..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? (
          <>
            <span className="spinner mr-2"></span>
            Submitting...
          </>
        ) : (
          'Submit Feedback'
        )}
      </button>
    </form>
  );
}
