import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import { BookOpenIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CommentList } from '@/components/comments/comment-list';
import { CommentForm } from '@/components/comments/comment-form';
import { DeleteReflectionButton } from '@/components/reflections/delete-reflection-button';

async function getReflection(id: string) {
  const reflection = await prisma.reflection.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!reflection || reflection.deletedAt) {
    return null;
  }

  return reflection;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reflection = await getReflection(id);

  if (!reflection) {
    return {
      title: 'Reflection Not Found - Church Friends',
    };
  }

  return {
    title: `${reflection.title} - Reflections - Church Friends`,
    description: reflection.body.slice(0, 160),
  };
}

export default async function ReflectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const adminUser = await isAdmin();

  const reflection = await getReflection(id);

  if (!reflection) {
    notFound();
  }

  // Check if user can view this reflection
  const canView =
    reflection.isApproved ||
    adminUser ||
    reflection.authorId === session?.user?.id;

  if (!canView) {
    redirect('/reflections');
  }

  const authorName = reflection.author.name || 'Anonymous';
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(reflection.author.email);

  const canDelete =
    adminUser || reflection.authorId === session?.user?.id;

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <a
          href="/reflections"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Back to Reflections
        </a>

        {/* Reflection Card */}
        <div className="card mt-4">
          <div className="flex gap-4">
            {/* Avatar */}
            {reflection.author.image ? (
              <img
                src={reflection.author.image}
                alt={authorName}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${avatarColor} text-sm font-medium text-white`}
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

                {/* Delete Button */}
                {canDelete && (
                  <DeleteReflectionButton reflectionId={reflection.id} />
                )}
              </div>

              <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {reflection.title}
              </h1>

              <div className="mt-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {reflection.body}
              </div>

              {/* Tags */}
              {reflection.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {reflection.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Moderation Notice */}
          {!reflection.isApproved && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This reflection is awaiting approval from an administrator.
              </p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({reflection.comments.length})
          </h2>

          <div className="mt-4">
            <CommentList comments={reflection.comments} />
          </div>

          {session?.user && (
            <div className="mt-6">
              <CommentForm
                targetType="reflection"
                targetId={reflection.id}
              />
            </div>
          )}

          {!session?.user && (
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <a
                href={`/auth/signin?callbackUrl=/reflections/${reflection.id}`}
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Sign in
              </a>{' '}
              to leave a comment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
