import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up - Community Hub',
  description: 'Invite-only registration',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  // Redirect if already signed in
  if (session?.user) {
    redirect(params.callbackUrl || '/');
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Invite-Only Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This community uses invite-only registration
          </p>
        </div>

        <div className="card">
          <div className="text-center space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Public registration has been disabled for this community. Accounts must be created by an administrator.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you would like to join, please contact an administrator to request an invitation.
            </p>
            <Link
              href="/auth/signin"
              className="btn-primary inline-block mt-4"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
