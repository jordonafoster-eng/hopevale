'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import { HeartIcon, HandRaisedIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

type Prayer = {
  id: string;
  title: string;
  body: string;
  type: 'REQUEST' | 'PRAISE';
  isAnonymous: boolean;
  reactionsCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
};

export function PrayerCard({
  prayer,
  userReaction,
  currentUserId,
  isAdmin,
}: {
  prayer: Prayer;
  userReaction?: string;
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isReacting, setIsReacting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName = prayer.isAnonymous
    ? 'Anonymous'
    : prayer.author?.name || 'Unknown';
  const authorEmail = prayer.author?.email || '';
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(authorEmail);

  const hasReacted = !!userReaction;

  const handleReaction = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to react');
      return;
    }

    try {
      setIsReacting(true);

      const response = await fetch(`/api/prayer/${prayer.id}/react`, {
        method: hasReacted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: 'prayed' }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to react');
        return;
      }

      toast.success(hasReacted ? 'Reaction removed' : 'Prayed!');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsReacting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prayer?')) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/prayer/${prayer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete');
        return;
      }

      toast.success('Prayer deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card">
      <div className="flex gap-4">
        {/* Avatar */}
        {!prayer.isAnonymous && prayer.author?.image ? (
          <img
            src={prayer.author.image}
            alt={authorName}
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${avatarColor} text-sm font-medium text-white`}
          >
            {initials}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {authorName}
                </p>
                <span
                  className={`badge ${
                    prayer.type === 'PRAISE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {prayer.type === 'PRAISE' ? 'Praise' : 'Request'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(prayer.createdAt)}
              </p>
            </div>

            {/* Admin Delete */}
            {(isAdmin || prayer.author?.id === currentUserId) && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                title="Delete prayer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
            {prayer.title}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {prayer.body}
          </p>

          {/* Reactions */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleReaction}
              disabled={isReacting || !currentUserId}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                hasReacted
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {hasReacted ? (
                <HeartIconSolid className="h-4 w-4" />
              ) : (
                <HandRaisedIcon className="h-4 w-4" />
              )}
              <span>
                {prayer.reactionsCount}{' '}
                {hasReacted ? 'Prayed (including you)' : 'Prayed'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
