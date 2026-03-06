'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  UserPlusIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
  status: string;
  createdAt: Date;
}

interface Invite {
  id: string;
  email: string | null;
  token: string;
  role: 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
  expiresAt: Date;
  createdAt: Date;
}

interface GroupSettingsProps {
  group: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  members: Member[];
  invites: Invite[];
  currentUserId: string;
  isSuperAdmin: boolean;
}

export function GroupSettings({
  group,
  members,
  invites,
  currentUserId,
  isSuperAdmin,
}: GroupSettingsProps) {
  const router = useRouter();
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'GROUP_ADMIN'>('MEMBER');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail || undefined,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invite');
      }

      toast.success('Invite created successfully');
      setInviteEmail('');
      setIsCreatingInvite(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite?')) return;

    try {
      const response = await fetch(`/api/groups/${group.id}/invites?inviteId=${inviteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete invite');
      }

      toast.success('Invite deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete invite');
    }
  };

  const copyInviteLink = async (token: string) => {
    const url = `${window.location.origin}/auth/signup?invite=${token}`;
    await navigator.clipboard.writeText(url);
    toast.success('Invite link copied to clipboard');
  };

  const handleRoleChange = async (userId: string, newRole: 'MEMBER' | 'GROUP_ADMIN') => {
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

      toast.success('Role updated successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Group Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Group Information
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
            <p className="text-gray-900 dark:text-white">{group.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</label>
            <p className="text-gray-900 dark:text-white">{group.slug}</p>
          </div>
          {group.description && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
              <p className="text-gray-900 dark:text-white">{group.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Invites Section */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invite Links
          </h2>
          {!isCreatingInvite && (
            <button
              onClick={() => setIsCreatingInvite(true)}
              className="btn-primary"
            >
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Create Invite
            </button>
          )}
        </div>

        {isCreatingInvite && (
          <form onSubmit={handleCreateInvite} className="mt-4 space-y-4 border-t pt-4 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email (optional)
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input mt-1"
                placeholder="Leave blank for generic invite link"
              />
              <p className="mt-1 text-xs text-gray-500">
                If specified, only this email can use the invite
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'GROUP_ADMIN')}
                className="input mt-1"
              >
                <option value="MEMBER">Member</option>
                <option value="GROUP_ADMIN">Group Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Creating...' : 'Create Invite'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingInvite(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {invites.length > 0 ? (
          <div className="mt-4 space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {invite.email || 'Generic invite link'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Role: {invite.role} | Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyInviteLink(invite.token)}
                    className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Copy invite link"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete invite"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No active invites. Create one to invite new members.
          </p>
        )}
      </div>

      {/* Members Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Members ({members.length})
        </h2>
        <div className="mt-4 space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.name || 'Unnamed User'}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-xs text-gray-500">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.id !== currentUserId && member.role !== 'SUPER_ADMIN' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as 'MEMBER' | 'GROUP_ADMIN')}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="GROUP_ADMIN">Group Admin</option>
                  </select>
                ) : (
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    member.role === 'SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : member.role === 'GROUP_ADMIN'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {member.role === 'SUPER_ADMIN' ? 'Super Admin' : member.role === 'GROUP_ADMIN' ? 'Group Admin' : 'Member'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
