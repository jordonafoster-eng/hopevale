import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignUpForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up - Church Friends',
  description: 'Create an account or join a group',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; invite?: string }>;
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
            {params.invite ? 'Join a Group' : 'Create Your Group'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {params.invite
              ? 'Complete your registration to join'
              : 'Start your own community group'}
          </p>
        </div>

        <SignUpForm
          callbackUrl={params.callbackUrl}
          inviteToken={params.invite}
        />
      </div>
    </div>
  );
}
