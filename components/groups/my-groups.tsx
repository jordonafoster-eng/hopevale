'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  UserGroupIcon,
  LinkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useSwitchGroup } from './use-switch-group';

interface MyGroup {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  role: 'MEMBER' | 'GROUP_ADMIN';
}

interface MyGroupsProps {
  activeGroupId: string | null;
  groups: MyGroup[];
}

/**
 * Pull the token out of a pasted invite link (or accept a bare token)
 */
function parseInviteToken(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get('invite') ?? url.searchParams.get('token') ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function MyGroups({ activeGroupId, groups }: MyGroupsProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { switchGroup, isSwitching } = useSwitchGroup();
  const [isCreating, setIsCreating] = useState(groups.length === 0);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }

      await update({});
      toast.success(`${data.group.name} created! Now invite some people.`);
      // Straight to group settings so they can create invite links
      router.push('/admin/group');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = parseInviteToken(inviteLink);
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group');
      }

      await update({});
      toast.success(data.message);
      setInviteLink('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManage = async (groupId: string) => {
    // Group settings always show the active group
    if (groupId !== activeGroupId && !(await switchGroup(groupId, { quiet: true }))) return;
    router.push('/admin/group');
  };

  const handleLeave = async (group: MyGroup) => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/members?userId=${session.user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave group');
      }

      await update({});
      toast.success(`You left ${group.name}`);
      setConfirmLeaveId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to leave group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Group list */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Groups ({groups.length})
          </h2>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="btn-primary">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Group
            </button>
          )}
        </div>

        {isCreating && (
          <form onSubmit={handleCreateGroup} className="mt-4 space-y-4 border-t pt-4 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input mt-1"
                placeholder="e.g. Tuesday Night Bible Study"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="input mt-1"
                rows={2}
                maxLength={500}
                placeholder="Optional — what's this group about?"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You&apos;ll be the group admin and can invite anyone you like.
            </p>
            <div className="flex gap-2">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Creating...' : 'Create Group'}
              </button>
              {groups.length > 0 && (
                <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {groups.length > 0 ? (
          <div className="mt-4 space-y-3">
            {groups.map((group) => {
              const isActive = group.id === activeGroupId;
              return (
                <div
                  key={group.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                    isActive
                      ? 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-950/40'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <UserGroupIcon className="h-10 w-10 flex-shrink-0 text-brand-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {group.name}
                        {isActive && (
                          <span className="badge-primary ml-2 px-2 py-0.5">Current</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''} ·{' '}
                        {group.role === 'GROUP_ADMIN' ? 'Admin' : 'Member'}
                      </p>
                      {group.description && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{group.description}</p>
                      )}
                    </div>
                  </div>

                  {confirmLeaveId === group.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Leave {group.name}?</span>
                      <button onClick={() => handleLeave(group)} disabled={isLoading} className="btn-danger">
                        Leave
                      </button>
                      <button onClick={() => setConfirmLeaveId(null)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          onClick={() => switchGroup(group.id)}
                          disabled={isSwitching}
                          className="btn-secondary"
                        >
                          Switch to
                        </button>
                      )}
                      {group.role === 'GROUP_ADMIN' && (
                        <button
                          onClick={() => handleManage(group.id)}
                          disabled={isSwitching}
                          className="btn-primary"
                        >
                          <Cog6ToothIcon className="mr-2 h-4 w-4" />
                          Manage &amp; Invite
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmLeaveId(group.id)}
                        className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Leave group"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !isCreating && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              You&apos;re not in any groups yet.
            </p>
          )
        )}
      </div>

      {/* Join with invite */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Join a Group</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Paste an invite link someone shared with you.
        </p>
        <form onSubmit={handleJoin} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              className="input pl-9"
              placeholder="https://…/auth/signup?invite=…"
            />
          </div>
          <button type="submit" disabled={isLoading || !inviteLink.trim()} className="btn-primary">
            {isLoading ? 'Joining...' : 'Join'}
          </button>
        </form>
      </div>
    </div>
  );
}
