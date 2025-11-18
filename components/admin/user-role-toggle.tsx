'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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

  const handleToggle = async () => {
    if (disabled) {
      toast.error('You cannot change your own role');
      return;
    }

    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      toast.success(`User role updated to ${newRole}`);
      router.refresh();
    } catch (_error) {
      toast.error('Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isUpdating}
      className={`btn-secondary text-xs ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {isUpdating ? 'Updating...' : disabled ? 'You' : `Make ${currentRole === 'ADMIN' ? 'Member' : 'Admin'}`}
    </button>
  );
}
