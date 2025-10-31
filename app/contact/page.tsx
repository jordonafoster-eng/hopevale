import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Contact - Community Hub',
  description: 'Contact us',
};

export default function ContactPage() {
  return (
    <div className="section">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="card mt-6 text-center">
          <div className="flex justify-center">
            <Image
              src="https://images.unsplash.com/photo-1575930427669-e9f05068be12?w=400&h=400&fit=crop"
              alt="Detective investigating"
              width={300}
              height={300}
              className="rounded-lg"
              priority
            />
          </div>

          <div className="mt-8">
            <h1 className="heading-2 mb-4">Contact Us?</h1>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              Caught you snooping!
            </p>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              What did you expect to find in this section?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
