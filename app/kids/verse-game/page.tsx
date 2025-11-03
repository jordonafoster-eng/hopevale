import { Metadata } from 'next';
import { VerseMatchingGame } from '@/components/kids/verse-matching-game';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Bible Verse Matching Game - Kids Corner',
  description: 'Fun Bible verse matching game for kids ages 3-12',
};

export default function VerseGamePage() {
  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Link
          href="/kids"
          className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Kids Corner
        </Link>

        {/* Game */}
        <div className="mt-6">
          <VerseMatchingGame />
        </div>
      </div>
    </div>
  );
}
