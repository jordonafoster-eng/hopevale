import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Schema for creating a new group
const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  groupName: z.string().min(2, 'Group name must be at least 2 characters').max(100),
});

// Schema for joining via invite token
const joinGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  inviteToken: z.string().min(1, 'Invite token is required'),
});

/**
 * Generate a URL-safe slug from a group name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine which flow to use based on presence of inviteToken or groupName
    const hasInviteToken = body.inviteToken && body.inviteToken.trim() !== '';
    const hasGroupName = body.groupName && body.groupName.trim() !== '';

    if (!hasInviteToken && !hasGroupName) {
      return NextResponse.json(
        { error: 'Either groupName (to create a new group) or inviteToken (to join an existing group) is required' },
        { status: 400 }
      );
    }

    // Check for existing user first
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email?.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    if (hasInviteToken) {
      // Join existing group via invite token
      return await handleJoinGroup(body);
    } else {
      // Create new group
      return await handleCreateGroup(body);
    }
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

/**
 * Handle creating a new group with the user as GROUP_ADMIN
 */
async function handleCreateGroup(body: unknown) {
  const data = createGroupSchema.parse(body);

  // Generate slug and check uniqueness
  let slug = generateSlug(data.groupName);
  let existingGroup = await prisma.group.findUnique({
    where: { slug },
  });

  // If slug exists, append a random suffix
  if (existingGroup) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${slug}-${suffix}`;

    // Double-check the new slug
    existingGroup = await prisma.group.findUnique({
      where: { slug },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'A group with a similar name already exists. Please choose a different name.' },
        { status: 400 }
      );
    }
  }

  // Create group and user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the group
    const group = await tx.group.create({
      data: {
        name: data.groupName,
        slug,
      },
    });

    // Hash password
    const hashedPassword = await hash(data.password, 12);

    // Create the user as GROUP_ADMIN
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: 'GROUP_ADMIN',
        groupId: group.id,
      },
    });

    // Create default notification preferences
    await tx.notificationPreference.create({
      data: { userId: user.id },
    });

    return { group, user };
  });

  return NextResponse.json(
    {
      message: 'Account created successfully',
      groupSlug: result.group.slug,
      groupName: result.group.name,
    },
    { status: 201 }
  );
}

/**
 * Handle joining an existing group via invite token
 */
async function handleJoinGroup(body: unknown) {
  const data = joinGroupSchema.parse(body);

  // Find and validate the invite
  const invite = await prisma.groupInvite.findUnique({
    where: { token: data.inviteToken },
    include: {
      group: true,
    },
  });

  if (!invite) {
    return NextResponse.json(
      { error: 'Invalid invite link' },
      { status: 400 }
    );
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { error: 'This invite has already been used' },
      { status: 400 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This invite has expired' },
      { status: 400 }
    );
  }

  // If invite is email-specific, verify it matches
  if (invite.email && invite.email.toLowerCase() !== data.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'This invite is for a different email address' },
      { status: 400 }
    );
  }

  // Check if the group is deleted
  if (invite.group.deletedAt) {
    return NextResponse.json(
      { error: 'This group no longer exists' },
      { status: 400 }
    );
  }

  // Create user and mark invite as used in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Hash password
    const hashedPassword = await hash(data.password, 12);

    // Create the user with the role specified in the invite
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: invite.role,
        groupId: invite.groupId,
      },
    });

    // Mark invite as used
    await tx.groupInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    // Create default notification preferences
    await tx.notificationPreference.create({
      data: { userId: user.id },
    });

    return { user, group: invite.group };
  });

  return NextResponse.json(
    {
      message: 'Account created successfully',
      groupSlug: result.group.slug,
      groupName: result.group.name,
    },
    { status: 201 }
  );
}
