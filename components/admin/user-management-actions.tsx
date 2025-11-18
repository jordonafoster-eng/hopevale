'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type UserManagementActionsProps = {
  userId: string;
  userName: string;
  userStatus: string;
  disabled?: boolean;
};

export function UserManagementActions({
  userId,
  userName,
  userStatus,
  disabled = false,
}: UserManagementActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      router.refresh();
    } catch (_error) {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = userStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const action = newStatus === 'BLOCKED' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    setIsTogglingStatus(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      toast.success(`User ${action}ed successfully`);
      router.refresh();
    } catch (_error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleStatus}
        disabled={disabled || isTogglingStatus}
        className={`${
          userStatus === 'ACTIVE'
            ? 'text-orange-600 hover:text-orange-700 dark:text-orange-400'
            : 'text-green-600 hover:text-green-700 dark:text-green-400'
        } disabled:opacity-50`}
        title={userStatus === 'ACTIVE' ? 'Block user' : 'Unblock user'}
      >
        {userStatus === 'ACTIVE' ? (
          <NoSymbolIcon className="h-5 w-5" />
        ) : (
          <CheckCircleIcon className="h-5 w-5" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={disabled || isDeleting}
        className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
        title="Delete user"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
