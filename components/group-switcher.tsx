'use client';

import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, BuildingOffice2Icon, CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface GroupSwitcherProps {
  groups: { id: string; name: string }[];
  currentGroupId: string | null;
  currentGroupName: string;
}

export function GroupSwitcher({ groups, currentGroupId, currentGroupName }: GroupSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchGroup = async (groupId: string | null) => {
    if (groupId === currentGroupId) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/switch-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to switch group');
      }

      const data = await response.json();
      toast.success(groupId ? `Viewing ${data.groupName}` : 'Viewing all groups');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to switch group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        disabled={isLoading}
        className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800"
      >
        <BuildingOffice2Icon className="h-3.5 w-3.5" />
        <span>{currentGroupId ? currentGroupName : 'All Groups'}</span>
        <ChevronDownIcon className="h-3.5 w-3.5" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Switch Group
          </div>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleSwitchGroup(null)}
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                <span>All Groups</span>
                {!currentGroupId && <CheckIcon className="h-4 w-4 text-brand-600" />}
              </button>
            )}
          </Menu.Item>

          <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

          {groups.map((group) => (
            <Menu.Item key={group.id}>
              {({ active }) => (
                <button
                  onClick={() => handleSwitchGroup(group.id)}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                >
                  <span>{group.name}</span>
                  {currentGroupId === group.id && <CheckIcon className="h-4 w-4 text-brand-600" />}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
