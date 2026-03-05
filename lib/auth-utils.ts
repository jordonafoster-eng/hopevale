import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
 */
export async function getGroupFilter(): Promise<{ groupId?: string }> {
  const groupId = await getEffectiveGroupId();

  // If groupId is null (SUPER_ADMIN viewing all), return empty filter
  if (groupId === null) {
    return {};
  }

  return { groupId };
}

/**
 * Check if user can manage content in a specific group.
 * - SUPER_ADMIN can manage any group
 * - GROUP_ADMIN can only manage their own group
 */
export async function canManageGroup(targetGroupId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // SUPER_ADMIN can manage any group
  if (session.user.role === 'SUPER_ADMIN') return true;

  // GROUP_ADMIN can manage their own group
  if (session.user.role === 'GROUP_ADMIN' && session.user.groupId === targetGroupId) {
    return true;
  }

  return false;
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

  return session.user.groupId === groupId;
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
