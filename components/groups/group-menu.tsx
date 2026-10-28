'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, UserGroupIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSwitchGroup } from './use-switch-group';

interface GroupMenuProps {
  groups: { id: string; name: string }[];
  currentGroupId: string | null;
  currentGroupName: string | null;
}

export function GroupMenu({ groups, currentGroupId, currentGroupName }: GroupMenuProps) {
  const { switchGroup, isSwitching } = useSwitchGroup();

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        disabled={isSwitching}
        className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800"
      >
        <UserGroupIcon className="h-3.5 w-3.5" />
        <span>{currentGroupName ?? 'No group'}</span>
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
          {groups.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Your Groups
              </div>
              {groups.map((group) => (
                <Menu.Item key={group.id}>
                  {({ active }) => (
                    <button
                      onClick={() => group.id !== currentGroupId && switchGroup(group.id)}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      <span className="truncate">{group.name}</span>
                      {currentGroupId === group.id && <CheckIcon className="h-4 w-4 text-brand-600" />}
                    </button>
                  )}
                </Menu.Item>
              ))}
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
            </>
          )}

          <Menu.Item>
            {({ active }) => (
              <Link
                href="/groups"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                <PlusIcon className="h-4 w-4" />
                Create or join a group
              </Link>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
