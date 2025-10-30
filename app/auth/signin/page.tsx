import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignInForm } from '@/components/auth/signin-form';

export const metadata: Metadata = {
  title: 'Sign In - Community Hub',
  description: 'Sign in to your account',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <SignInForm
          callbackUrl={params.callbackUrl}
          error={params.error}
        />
      </div>
    </div>
  );
}
