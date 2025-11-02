import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { EventForm } from '@/components/events/event-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Create Event',
  description: 'Create a new community event',
};

export default async function NewEventPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
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
          <h1 className="heading-2">Create New Event</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill in the details below to create a new event
          </p>
        </div>

        <div className="card mt-6">
          <EventForm mode="create" />
        </div>
      </div>
    </div>
  );
}
