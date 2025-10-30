import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import { DeleteReflectionButton } from '@/components/reflections/delete-reflection-button';
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reflection = await prisma.reflection.findUnique({
    where: { id },
    select: { title: true, body: true },
  });

  if (!reflection) {
    return {
      title: 'Reflection Not Found',
    };
  }

  return {
    title: `${reflection.title} - Community Hub`,
    description: reflection.body.substring(0, 155),
  };
}

async function getReflection(id: string) {
  return prisma.reflection.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export default async function ReflectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reflection, session] = await Promise.all([
    getReflection(id),
    auth(),
  ]);

  if (!reflection || reflection.deletedAt) {
    notFound();
  }

  const authorName = reflection.author.name || 'Anonymous';
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(reflection.author.email);

  const isAuthor = session?.user?.id === reflection.author.id;
  const isAdmin = session?.user?.role === 'ADMIN';
  const canDelete = isAuthor || isAdmin;

  return (
    <div className="section">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/reflections"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Reflections
        </Link>

        <article className="card mt-6">
          {/* Author Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${avatarColor} text-sm font-medium text-white`}
              >
                {initials}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {authorName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(reflection.createdAt)}
                </p>
              </div>
            </div>

            {canDelete && (
              <DeleteReflectionButton
                reflectionId={reflection.id}
                isAuthor={isAuthor}
              />
            )}
          </div>

          {/* Title */}
          <h1 className="mt-6 heading-2">{reflection.title}</h1>

          {/* Tags */}
          {reflection.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {reflection.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/reflections?tag=${tag}`}
                  className="badge-secondary hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-900 dark:hover:text-brand-300"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="prose prose-gray mt-6 max-w-none whitespace-pre-wrap dark:prose-invert">
            {reflection.body}
          </div>

          {/* Share */}
          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="btn-secondary"
            >
              <ShareIcon className="mr-2 h-5 w-5" />
              Share Reflection
            </button>
          </div>
        </article>

        {/* Related Reflections */}
        {reflection.tags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Related Reflections
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Explore more reflections with similar tags
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reflection.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/reflections?tag=${tag}`}
                  className="btn-secondary"
                >
                  View all &quot;{tag}&quot; reflections
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
