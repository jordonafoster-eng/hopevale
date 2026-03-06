'use client';

import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface GroupActionsProps {
  groupId: string;
  groupName: string;
  isArchived?: boolean;
}

export function GroupActions({ groupId, groupName, isArchived }: GroupActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to archive "${groupName}"? Members will no longer be able to access group content.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to archive group');
      }

      toast.success('Group archived successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore group');
      }

      toast.success('Group restored successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restore group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        disabled={isLoading}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          {isArchived ? (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleRestore}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Restore Group
                </button>
              )}
            </Menu.Item>
          ) : (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleArchive}
                  className={`${
                    active ? 'bg-red-50 dark:bg-red-900/20' : ''
                  } flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                >
                  <ArchiveBoxIcon className="h-4 w-4" />
                  Archive Group
                </button>
              )}
            </Menu.Item>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
