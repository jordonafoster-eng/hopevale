'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface InviteInfo {
  valid: boolean;
  group?: { name: string; slug: string };
  error?: string;
}

/**
 * Lets an already signed-in user accept an invite link.
 */
export function AcceptInvite({ inviteToken, userEmail }: { inviteToken: string; userEmail: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/join?token=${encodeURIComponent(inviteToken)}`)
      .then((res) => res.json())
      .then(setInviteInfo)
      .catch(() => setInviteInfo({ valid: false, error: 'Failed to validate invite' }));
  }, [inviteToken]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inviteToken }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group');
      }

      await update({});
      toast.success(data.message);
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join group');
      setIsJoining(false);
    }
  };

  if (!inviteInfo) {
    return (
      <div className="card flex justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!inviteInfo.valid) {
    return (
      <div className="card text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{inviteInfo.error}</p>
        <Link href="/groups" className="btn-secondary mt-4">
          Go to My Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="card text-center">
      <p className="text-gray-700 dark:text-gray-300">
        You&apos;ve been invited to join{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{inviteInfo.group?.name}</span>.
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Joining as {userEmail}. You&apos;ll keep access to your other groups.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={handleJoin} disabled={isJoining} className="btn-primary">
          {isJoining ? 'Joining...' : `Join ${inviteInfo.group?.name}`}
        </button>
        <Link href="/" className="btn-secondary">
          Not now
        </Link>
      </div>
    </div>
  );
}
