import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About Us - Community Hub',
  description: 'About our community',
};

export default function AboutPage() {
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
              src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop"
              alt="Confused person"
              width={300}
              height={300}
              className="rounded-lg"
              priority
            />
          </div>

          <div className="mt-8">
            <h1 className="heading-2 mb-4">About Us?</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Why did you click that? You are in the group.. therefore you are a part of the <strong>US</strong>...
            </p>
            <p className="mt-4 text-xl font-semibold text-brand-600 dark:text-brand-400">
              I&apos;ll pray for you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
