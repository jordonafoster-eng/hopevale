'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function EventAdminActions({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully');
      router.push('/events');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete event');
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/events/${eventId}/edit`}
        className="btn-secondary inline-flex items-center"
      >
        <PencilIcon className="mr-2 h-4 w-4" />
        Edit Event
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="btn-secondary inline-flex items-center text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
