import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMembershipRole } from '@/lib/groups';

// Re-export auth for convenience
export { auth };

// Type for role hierarchy
export type UserRole = 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';

/**
 * Get current session or redirect to sign in
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }
  return session;
}

/**
 * Require GROUP_ADMIN or SUPER_ADMIN role, or redirect to home
 */
export async function requireGroupAdmin() {
  const session = await requireAuth();
  if (session.user.role === 'MEMBER') {
    redirect('/');
  }
  return session;
}

/**
 * Require SUPER_ADMIN role, or redirect to home
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }
  return session;
}

/**
 * Check if user is SUPER_ADMIN
 */
export async function isSuperAdmin() {
  const session = await auth();
  return session?.user?.role === 'SUPER_ADMIN';
}

/**
 * Check if user is GROUP_ADMIN or SUPER_ADMIN
 */
export async function isGroupAdminOrHigher() {
  const session = await auth();
  return session?.user?.role === 'GROUP_ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

/**
 * Legacy alias for backward compatibility - checks if user can manage content
 * @deprecated Use isGroupAdminOrHigher() instead
 */
export async function isAdmin() {
  return isGroupAdminOrHigher();
}

/**
 * Get current user or null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get the effective groupId for content queries.
 * - For regular users: returns their groupId
 * - For SUPER_ADMIN: returns viewingGroupId if set, otherwise null (all groups)
 */
export async function getEffectiveGroupId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role === 'SUPER_ADMIN') {
    // Return viewingGroupId if set, otherwise null (viewing all groups)
    return session.user.viewingGroupId ?? null;
  }

  return session.user.groupId;
}

/**
 * Build group filter for Prisma queries.
 * Returns an object that can be spread into a Prisma where clause.
 * - For regular users: { groupId: <their groupId> }
 * - For SUPER_ADMIN viewing specific group: { groupId: <viewingGroupId> }
 * - For SUPER_ADMIN viewing all: {} (no filter)
 * - For users with no group: a filter that matches nothing
 */
export async function getGroupFilter(): Promise<{ groupId?: string }> {
  const session = await auth();
  const groupId = await getEffectiveGroupId();

  if (groupId === null) {
    // SUPER_ADMIN viewing all groups: no filter
    if (session?.user?.role === 'SUPER_ADMIN') return {};

    // Users without a group (e.g. just signed up) see no group content
    return { groupId: NO_GROUP };
  }

  return { groupId };
}

// A groupId that never matches, for users who don't belong to any group
const NO_GROUP = '__no_group__';

/**
 * Check if the current user may view or interact with content from a group.
 * SUPER_ADMIN can see everything; others must be a member of the content's group.
 */
export async function canViewGroupContent(contentGroupId: string | null): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  if (session.user.role === 'SUPER_ADMIN') return true;
  if (!contentGroupId) return false;

  return (await getMembershipRole(session.user.id, contentGroupId)) !== null;
}

/**
 * Check if user can manage a specific group.
 * - SUPER_ADMIN can manage any group
 * - Otherwise the user must be a GROUP_ADMIN member of that group
 */
export async function canManageGroup(targetGroupId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // SUPER_ADMIN can manage any group
  if (session.user.role === 'SUPER_ADMIN') return true;

  return (await getMembershipRole(session.user.id, targetGroupId)) === 'GROUP_ADMIN';
}

/**
 * Check if user can modify a specific piece of content.
 * @param contentGroupId - The groupId of the content
 * @param contentAuthorId - Optional author ID of the content
 */
export async function canModifyContent(
  contentGroupId: string,
  contentAuthorId?: string | null
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // SUPER_ADMIN can modify anything
  if (session.user.role === 'SUPER_ADMIN') return true;

  // GROUP_ADMIN can modify content in their group
  if (session.user.role === 'GROUP_ADMIN' && session.user.groupId === contentGroupId) {
    return true;
  }

  // Content author can modify their own content
  if (contentAuthorId && contentAuthorId === session.user.id) {
    return true;
  }

  return false;
}

/**
 * Verify user belongs to specified group (or is SUPER_ADMIN).
 */
export async function verifyGroupMembership(groupId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // SUPER_ADMIN can access any group
  if (session.user.role === 'SUPER_ADMIN') return true;

  return (await getMembershipRole(session.user.id, groupId)) !== null;
}

/**
 * Get the user's group ID, throwing an error if they don't have one.
 * Useful for operations that require a group context.
 */
export async function requireGroupId(): Promise<string> {
  const session = await requireAuth();

  if (!session.user.groupId) {
    throw new Error('User must belong to a group to perform this action');
  }

  return session.user.groupId;
}

/**
 * Check if the current user can edit or delete admin-managed group content
 * (music playlists, kids corner assets). Content shared with all groups, or
 * without a group, is SUPER_ADMIN-only.
 */
export async function canManageGroupContent(
  contentGroupId: string | null,
  isGlobal = false
): Promise<boolean> {
  if (isGlobal || !contentGroupId) return isSuperAdmin();
  return canManageGroup(contentGroupId);
}

/**
 * Prisma filter for content that SUPER_ADMINs can share with every group
 * (music playlists, kids corner assets): the user's group plus shared items.
 */
export async function getSharedContentFilter(): Promise<
  { OR: [{ groupId?: string }, { isGlobal: true }] } | Record<string, never>
> {
  const groupFilter = await getGroupFilter();

  // SUPER_ADMIN viewing all groups: no filter
  if (!('groupId' in groupFilter)) return {};

  return { OR: [groupFilter, { isGlobal: true }] };
}

/**
 * The group that new admin-managed content should belong to:
 * the group being viewed (SUPER_ADMIN) or the user's active group.
 */
export async function getGroupIdForNewContent(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  return (await getEffectiveGroupId()) ?? session.user.groupId;
}

/**
 * Decide which group new music/kids content belongs to and whether the
 * current user may add it. Only SUPER_ADMINs may share content with all groups.
 */
export async function resolveNewContentGroup(
  isGlobal: boolean
): Promise<{ groupId: string | null } | { error: string; status: number }> {
  const superAdmin = await isSuperAdmin();

  if (isGlobal && !superAdmin) {
    return { error: 'Only super admins can share content with all groups', status: 403 };
  }

  const groupId = await getGroupIdForNewContent();

  // Shared content doesn't need a home group
  if (isGlobal) return { groupId };

  if (!groupId || !(await canManageGroup(groupId))) {
    return { error: 'You must be an admin of a group to add content', status: 403 };
  }

  return { groupId };
}
