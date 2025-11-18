'use client';

import { formatDistanceToNow } from 'date-fns';

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

type CommentListProps = {
  comments: Comment[];
};

// Generate consistent color for user based on their ID
function getAvatarColor(userId: string) {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

function getInitials(name: string | null, email: string) {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const authorName = comment.author.name || comment.author.email;
        const initials = getInitials(comment.author.name, comment.author.email);
        const avatarColor = getAvatarColor(comment.author.id);
        const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

        return (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            {comment.author.image ? (
              <img
                src={comment.author.image}
                alt={authorName}
                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${avatarColor} text-xs font-medium text-white`}
              >
                {initials}
              </div>
            )}

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">
                  {authorName}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {timeAgo}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.body}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
