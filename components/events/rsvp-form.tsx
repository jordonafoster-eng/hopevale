'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const rsvpSchema = z.object({
  adults: z.number().min(0).max(20),
  kids: z.number().min(0).max(20),
  note: z.string().optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

type ExistingRSVP = {
  id: string;
  adults: number;
  kids: number;
  note: string | null;
};

export function RSVPForm({
  eventId,
  existingRSVP,
  userId,
}: {
  eventId: string;
  existingRSVP?: ExistingRSVP | null;
  userId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      adults: existingRSVP?.adults || 1,
      kids: existingRSVP?.kids || 0,
      note: existingRSVP?.note || '',
    },
  });

  const onSubmit = async (data: RSVPFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: existingRSVP ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to RSVP');
        return;
      }

      toast.success(
        existingRSVP ? 'RSVP updated successfully!' : 'RSVP submitted successfully!'
      );
      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel your RSVP?')) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to cancel RSVP');
        return;
      }

      toast.success('RSVP cancelled successfully');
      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="adults"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Adults
          </label>
          <input
            {...register('adults', { valueAsNumber: true })}
            type="number"
            id="adults"
            min="0"
            max="20"
            className="input mt-1"
          />
          {errors.adults && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.adults.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="kids"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Kids
          </label>
          <input
            {...register('kids', { valueAsNumber: true })}
            type="number"
            id="kids"
            min="0"
            max="20"
            className="input mt-1"
          />
          {errors.kids && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.kids.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Note (optional)
        </label>
        <textarea
          {...register('note')}
          id="note"
          rows={3}
          className="input mt-1"
          placeholder="Any special requests or dietary restrictions?"
        />
        {errors.note && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.note.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1"
        >
          {isSubmitting ? (
            <>
              <span className="spinner mr-2"></span>
              {existingRSVP ? 'Updating...' : 'Submitting...'}
            </>
          ) : existingRSVP ? (
            'Update RSVP'
          ) : (
            'RSVP Now'
          )}
        </button>

        {existingRSVP && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-danger"
          >
            {isDeleting ? (
              <>
                <span className="spinner mr-2"></span>
                Cancelling...
              </>
            ) : (
              'Cancel RSVP'
            )}
          </button>
        )}
      </div>
    </form>
  );
}
