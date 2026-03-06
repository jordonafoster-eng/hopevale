'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  groupName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface InviteInfo {
  valid: boolean;
  group?: {
    name: string;
    slug: string;
  };
  emailRestricted?: boolean;
  error?: string;
}

export function SignUpForm({
  callbackUrl,
  inviteToken,
}: {
  callbackUrl?: string;
  inviteToken?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Validate invite token on mount
  useEffect(() => {
    if (inviteToken) {
      validateInvite(inviteToken);
    }
  }, [inviteToken]);

  const validateInvite = async (token: string) => {
    try {
      setInviteLoading(true);
      const response = await fetch(`/api/groups/join?token=${token}`);
      const data = await response.json();
      setInviteInfo(data);
    } catch {
      setInviteInfo({ valid: false, error: 'Failed to validate invite' });
    } finally {
      setInviteLoading(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    // Validate group name if not using invite
    if (!inviteToken && !data.groupName?.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          ...(inviteToken
            ? { inviteToken }
            : { groupName: data.groupName }),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to create account');
        return;
      }

      // Sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('Account created, but failed to sign in. Please sign in manually.');
        router.push('/auth/signin');
        return;
      }

      toast.success(
        inviteToken
          ? `Welcome to ${result.groupName}!`
          : `Group "${result.groupName}" created successfully!`
      );
      router.push(callbackUrl || '/');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating invite
  if (inviteLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Validating invite...</span>
        </div>
      </div>
    );
  }

  // Show error if invite is invalid
  if (inviteToken && inviteInfo && !inviteInfo.valid) {
    return (
      <div className="card">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invalid Invite</h3>
          <p className="text-gray-600 dark:text-gray-400">{inviteInfo.error}</p>
          <Link href="/auth/signup" className="btn-primary inline-block mt-4">
            Create Your Own Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Show group info if joining via invite */}
      {inviteToken && inviteInfo?.valid && inviteInfo.group && (
        <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            You&apos;re joining:
          </p>
          <p className="text-lg font-semibold text-brand-900 dark:text-brand-100">
            {inviteInfo.group.name}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Full name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            autoComplete="name"
            className="input mt-1"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className="input mt-1"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Group name field - only show if NOT using invite */}
        {!inviteToken && (
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Group name
            </label>
            <input
              {...register('groupName')}
              type="text"
              id="groupName"
              className="input mt-1"
              placeholder="My Church Small Group"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be the name of your community group
            </p>
            {errors.groupName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.groupName.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="new-password"
            className="input mt-1"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            className="input mt-1"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="spinner mr-2"></span>
              {inviteToken ? 'Joining group...' : 'Creating group...'}
            </>
          ) : inviteToken ? (
            'Join Group'
          ) : (
            'Create Group'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          href="/auth/signin"
          className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          Sign in
        </Link>
      </p>

      {inviteToken && (
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Want to create your own group instead?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Create a group
          </Link>
        </p>
      )}

      <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        By signing up, you agree to our{' '}
        <Link href="/privacy-policy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
