import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;
type GroupRole = 'MEMBER' | 'GROUP_ADMIN';

/**
 * Generate a URL-safe slug from a group name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a slug that isn't already taken, appending a random suffix if needed.
 * Returns null if no unique slug could be found.
 */
export async function generateUniqueSlug(name: string): Promise<string | null> {
  const base = generateSlug(name) || 'group';

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).substring(2, 6)}`;
    const existing = await prisma.group.findUnique({ where: { slug } });
    if (!existing) return slug;
  }

  return null;
}

/**
 * Get a user's role within a group, or null if they aren't a member.
 */
export async function getMembershipRole(userId: string, groupId: string): Promise<GroupRole | null> {
  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { role: true },
  });

  return (membership?.role as GroupRole | undefined) ?? null;
}

/**
 * Add a user to a group (or update their role if already a member).
 */
export async function addMembership(
  tx: Tx,
  userId: string,
  groupId: string,
  role: GroupRole
) {
  return tx.groupMembership.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: { userId, groupId, role },
    update: { role },
  });
}

/**
 * Make a group the user's active group. User.role mirrors their role in the
 * active group, except SUPER_ADMIN which is global and never overwritten.
 */
export async function setActiveGroup(tx: Tx, userId: string, groupId: string | null) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  });

  let role = user.role;
  if (user.role !== 'SUPER_ADMIN') {
    if (groupId) {
      const membership = await tx.groupMembership.findUniqueOrThrow({
        where: { userId_groupId: { userId, groupId } },
        select: { role: true },
      });
      role = membership.role;
    } else {
      role = 'MEMBER';
    }
  }

  return tx.user.update({
    where: { id: userId },
    data: { groupId, role },
  });
}

/**
 * Remove a user from a group. If it was their active group, they're moved to
 * another of their groups (or left with no group).
 */
export async function removeMembership(tx: Tx, userId: string, groupId: string) {
  await tx.groupMembership.deleteMany({ where: { userId, groupId } });

  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { groupId: true },
  });

  if (user.groupId === groupId) {
    const next = await tx.groupMembership.findFirst({
      where: { userId, group: { deletedAt: null } },
      orderBy: { createdAt: 'asc' },
      select: { groupId: true },
    });
    await setActiveGroup(tx, userId, next?.groupId ?? null);
  }
}

/**
 * Update a member's role within a group, keeping User.role in sync if it's their active group.
 */
export async function updateMembershipRole(tx: Tx, userId: string, groupId: string, role: GroupRole) {
  await tx.groupMembership.update({
    where: { userId_groupId: { userId, groupId } },
    data: { role },
  });

  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { groupId: true },
  });

  if (user.groupId === groupId) {
    await setActiveGroup(tx, userId, groupId);
  }
}

/**
 * Count the admins of a group (used to prevent a group from being left without one).
 */
export async function countGroupAdmins(groupId: string) {
  return prisma.groupMembership.count({
    where: { groupId, role: 'GROUP_ADMIN', user: { status: 'ACTIVE' } },
  });
}

/**
 * Generic member invite links can be shared and reused until they expire.
 * Email-specific invites and admin invites are single-use.
 */
export function isReusableInvite(invite: { email: string | null; role: string }) {
  return !invite.email && invite.role === 'MEMBER';
}

/**
 * Look up an invite token and check that it can still be used.
 */
export async function findUsableInvite(token: string) {
  const invite = await prisma.groupInvite.findUnique({
    where: { token },
    include: { group: true },
  });

  if (!invite) return { error: 'Invalid invite link', status: 404 } as const;
  if (invite.usedAt) return { error: 'This invite has already been used', status: 400 } as const;
  if (invite.expiresAt < new Date()) return { error: 'This invite has expired', status: 400 } as const;
  if (invite.group.deletedAt) return { error: 'This group no longer exists', status: 400 } as const;

  return { invite } as const;
}

/**
 * Add a user to the invite's group, make it their active group, and use up the
 * invite if it's single-use. Never downgrades an existing GROUP_ADMIN.
 */
export async function acceptInvite(
  tx: Tx,
  userId: string,
  invite: { id: string; groupId: string; email: string | null; role: string }
) {
  const existing = await tx.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId: invite.groupId } },
    select: { role: true },
  });

  const role: GroupRole =
    existing?.role === 'GROUP_ADMIN' || invite.role === 'GROUP_ADMIN' ? 'GROUP_ADMIN' : 'MEMBER';

  await addMembership(tx, userId, invite.groupId, role);
  await setActiveGroup(tx, userId, invite.groupId);

  if (!isReusableInvite(invite)) {
    await tx.groupInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
  }
}
