'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export function RatingForm({ recipeId, existingRating }: { recipeId: string; existingRating?: { rating: number; comment: string | null } | null }) {
  const router = useRouter();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/recipes/${recipeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment || null }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to submit rating');
        return;
      }

      toast.success(existingRating ? 'Rating updated!' : 'Rating submitted!');
      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              {star <= (hover || rating) ? (
                <StarIcon className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarOutlineIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comment (optional)</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="input mt-1" placeholder="Share your thoughts..." />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? <><span className="spinner mr-2"></span>Submitting...</> : existingRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  );
}
