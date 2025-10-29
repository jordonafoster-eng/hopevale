'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function DeleteReflectionButton({
  reflectionId,
  isAuthor,
}: {
  reflectionId: string;
  isAuthor: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reflection?')) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/reflections/${reflectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete');
        return;
      }

      toast.success('Reflection deleted successfully');
      router.push('/reflections');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex-shrink-0 rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
      title="Delete reflection"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  );
}
