import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignUpForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up - Community Hub',
  description: 'Create your account',
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join our community and start connecting
          </p>
        </div>

        <SignUpForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  );
}
