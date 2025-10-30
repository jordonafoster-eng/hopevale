import { Metadata } from 'next';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Authentication Error - Community Hub',
  description: 'An error occurred during authentication',
};

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  OAuthSignin: 'Error in constructing an authorization URL.',
  OAuthCallback: 'Error in handling the response from an OAuth provider.',
  OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
  EmailCreateAccount: 'Could not create email provider user in the database.',
  Callback: 'Error in the OAuth callback handler route.',
  OAuthAccountNotLinked: 'Email already exists with a different provider.',
  EmailSignin: 'Failed to send the email with the verification token.',
  CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred.',
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorParam } = await searchParams;
  const error = errorParam || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
        </div>

        <div className="card space-y-4">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">
              <strong>Error code:</strong> {error}
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin" className="btn-primary block w-full text-center">
              Try signing in again
            </Link>
            <Link href="/" className="btn-secondary block w-full text-center">
              Go back home
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <Link
                href="/feedback"
                className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
