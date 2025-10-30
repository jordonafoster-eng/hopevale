import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { EventForm } from '@/components/admin/event-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Edit Event - Admin',
  description: 'Edit event details',
};

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  return event;
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect('/');
  }

  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="section">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/events"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Events
        </Link>

        <div className="mt-6">
          <h1 className="heading-2">Edit Event</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update the event details below
          </p>
        </div>

        <div className="card mt-6">
          <EventForm event={event} mode="edit" />
        </div>
      </div>
    </div>
  );
}
