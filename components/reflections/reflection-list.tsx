import Link from 'next/link';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type Reflection = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  comments: Comment[];
};

export function ReflectionList({
  reflections,
  currentUserId: _currentUserId,
}: {
  reflections: Reflection[];
  currentUserId?: string;
}) {
  return (
    <div className="space-y-6">
      {reflections.map((reflection) => {
        const authorName = reflection.author.name || 'Anonymous';
        const initials = getInitials(authorName);
        const avatarColor = getAvatarColor(reflection.author.email);

        return (
          <Link
            key={reflection.id}
            href={`/reflections/${reflection.id}`}
            className="card-hover block"
          >
            <div className="flex gap-4">
              {/* Avatar */}
              {reflection.author.image ? (
                <img
                  src={reflection.author.image}
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
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {authorName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(reflection.createdAt)}
                    </p>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {reflection.title}
                </h3>

                <p className="mt-2 line-clamp-3 text-gray-700 dark:text-gray-300">
                  {reflection.body}
                </p>

                {/* Tags */}
                {reflection.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {reflection.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge-secondary text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment Count */}
                {reflection.comments.length > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span>
                      {reflection.comments.length}{' '}
                      {reflection.comments.length === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
