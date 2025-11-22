'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Event = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date | null;
  endAt: Date | null;
  location: string | null;
  isPotluck: boolean;
  capacity: number | null;
  tags: string[];
  isPublished: boolean;
};

type EventFormProps = {
  event?: Event;
  mode: 'create' | 'edit';
};

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startAt: event?.startAt
      ? new Date(event.startAt).toISOString().slice(0, 16)
      : '',
    endAt: event?.endAt
      ? new Date(event.endAt).toISOString().slice(0, 16)
      : '',
    location: event?.location || '',
    isPotluck: event?.isPotluck || false,
    capacity: event?.capacity?.toString() || '',
    tags: event?.tags?.join(', ') || '',
    isPublished: event?.isPublished ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        startAt: formData.startAt ? formData.startAt + ':00.000Z' : null,
        endAt: formData.endAt ? formData.endAt + ':00.000Z' : null,
        location: formData.location || null,
        isPotluck: formData.isPotluck,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        isPublished: formData.isPublished,
      };

      const url =
        mode === 'create'
          ? '/api/admin/events'
          : `/api/admin/events/${event?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save event');
      }

      toast.success(
        mode === 'create' ? 'Event created successfully!' : 'Event updated successfully!'
      );
      router.push('/events');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input mt-1"
          placeholder="Sunday Worship Service"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input mt-1"
          rows={4}
          placeholder="Event details, what to bring, etc."
        />
      </div>

      {/* Date and Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.startAt}
            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            className="input mt-1"
            placeholder="Optional"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave blank for TBD events
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.endAt}
            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            className="input mt-1"
            placeholder="Optional"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave blank if unknown
          </p>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="input mt-1"
          placeholder="Church Sanctuary, 123 Main St"
        />
      </div>

      {/* Capacity and Potluck */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Capacity (leave empty for unlimited)
          </label>
          <input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="input mt-1"
            placeholder="50"
          />
        </div>
        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="isPotluck"
            checked={formData.isPotluck}
            onChange={(e) => setFormData({ ...formData, isPotluck: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <label
            htmlFor="isPotluck"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            This is a potluck event
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="input mt-1"
          placeholder="worship, youth, fellowship"
        />
      </div>

      {/* Published Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublished"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        <label
          htmlFor="isPublished"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Publish event (uncheck to save as draft)
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Updating...'
            : mode === 'create'
            ? 'Create Event'
            : 'Update Event'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
