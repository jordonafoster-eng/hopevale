'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Role = 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';

export function UserRoleToggle({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // Determine the new role based on current role
  const getNewRole = (): Role => {
    if (currentRole === 'MEMBER') return 'GROUP_ADMIN';
    if (currentRole === 'GROUP_ADMIN') return 'MEMBER';
    return currentRole as Role; // SUPER_ADMIN stays as is
  };

  const handleToggle = async () => {
    if (disabled) {
      toast.error('You cannot change your own role');
      return;
    }

    if (currentRole === 'SUPER_ADMIN') {
      toast.error('Cannot change SUPER_ADMIN role');
      return;
    }

    const newRole = getNewRole();

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      const roleLabel = newRole === 'GROUP_ADMIN' ? 'Group Admin' : 'Member';
      toast.success(`User role updated to ${roleLabel}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  const getButtonLabel = () => {
    if (isUpdating) return 'Updating...';
    if (disabled) return 'You';
    if (currentRole === 'SUPER_ADMIN') return 'Super Admin';
    if (currentRole === 'GROUP_ADMIN') return 'Make Member';
    return 'Make Admin';
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isUpdating || currentRole === 'SUPER_ADMIN'}
      className={`btn-secondary text-xs ${
        disabled || currentRole === 'SUPER_ADMIN' ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {getButtonLabel()}
    </button>
  );
}
