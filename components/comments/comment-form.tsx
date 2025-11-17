'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type CommentFormProps = {
  targetType: 'prayer' | 'reflection' | 'event';
  targetId: string;
  onCommentAdded?: () => void;
};

export function CommentForm({ targetType, targetId, onCommentAdded }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (body.length > 1000) {
      toast.error('Comment must be less than 1000 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      const apiUrl =
        targetType === 'prayer'
          ? `/api/prayer/${targetId}/comments`
          : targetType === 'reflection'
          ? `/api/reflections/${targetId}/comments`
          : `/api/events/${targetId}/comments`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to post comment');
        return;
      }

      toast.success('Comment posted!');
      setBody('');

      // Call callback if provided
      if (onCommentAdded) {
        onCommentAdded();
      }

      router.refresh();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div>
        <label htmlFor="comment" className="sr-only">
          Add a comment
        </label>
        <textarea
          id="comment"
          rows={3}
          className="input"
          placeholder="Add a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="btn-primary"
        >
          {isSubmitting ? (
            <>
              <span className="spinner mr-2"></span>
              Posting...
            </>
          ) : (
            'Post Comment'
          )}
        </button>
      </div>
    </form>
  );
}
