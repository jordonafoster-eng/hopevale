'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type SuperAdminToggleProps = {
  userId: string;
  userName: string;
  isSuperAdmin: boolean;
};

/**
 * Lets a SUPER_ADMIN grant or remove super admin access for another user.
 */
export function SuperAdminToggle({ userId, userName, isSuperAdmin }: SuperAdminToggleProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirm = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Removing super admin restores their previous role in their group
        body: JSON.stringify({ role: isSuperAdmin ? 'MEMBER' : 'SUPER_ADMIN' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      toast.success(
        isSuperAdmin ? `${userName} is no longer a super admin` : `${userName} is now a super admin`
      );
      setIsConfirming(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isConfirming) {
    return (
      <span className="flex items-center gap-1">
        <button onClick={handleConfirm} disabled={isUpdating} className="btn-danger px-2 py-1 text-xs">
          {isUpdating ? 'Saving...' : 'Confirm'}
        </button>
        <button onClick={() => setIsConfirming(false)} className="btn-secondary px-2 py-1 text-xs">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="btn-secondary text-xs"
      title={
        isSuperAdmin
          ? 'Remove super admin access'
          : 'Super admins can manage every group and share locked content with all groups'
      }
    >
      {isSuperAdmin ? 'Remove Super Admin' : 'Make Super Admin'}
    </button>
  );
}
