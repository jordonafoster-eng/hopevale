'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Switch the current user's active group, refresh their session, and re-render.
 */
export function useSwitchGroup() {
  const router = useRouter();
  const { update } = useSession();
  const [isSwitching, setIsSwitching] = useState(false);

  const switchGroup = async (groupId: string, { quiet = false } = {}) => {
    try {
      setIsSwitching(true);
      const response = await fetch('/api/user/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to switch group');
      }

      // Reloads role and group from the database into the session token
      await update({});
      if (!quiet) toast.success(data.message);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to switch group');
      return false;
    } finally {
      setIsSwitching(false);
    }
  };

  return { switchGroup, isSwitching };
}
