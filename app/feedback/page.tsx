import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Feedback - Community Hub',
  description: 'Share your feedback and suggestions',
};

export default async function FeedbackPage() {
  const session = await auth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="mt-4 heading-2">Feedback</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We value your input! Share your thoughts, suggestions, or report issues
          </p>
        </div>

        <div className="card mt-8">
          <FeedbackForm userId={session?.user?.id} />
        </div>

        <div className="card mt-6 bg-indigo-50 dark:bg-indigo-950">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            How we use your feedback
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• All feedback is reviewed by our team</li>
            <li>• You can submit anonymously if preferred</li>
            <li>• We use feedback to improve our community</li>
            <li>• For urgent matters, please contact us directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
