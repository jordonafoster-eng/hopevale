import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { acceptInvite, addMembership, findUsableInvite, generateUniqueSlug } from '@/lib/groups';

// Schema for a plain account (no group yet)
const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine which flow to use based on presence of inviteToken or groupName
    const hasInviteToken = body.inviteToken && body.inviteToken.trim() !== '';
    const hasGroupName = body.groupName && body.groupName.trim() !== '';

    // Check for existing user first
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email?.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Sign in to create or join groups.' },
        { status: 400 }
      );
    }

    if (hasInviteToken) {
      // Join existing group via invite token
      return await handleJoinGroup(body);
    } else if (hasGroupName) {
      // Create new group
      return await handleCreateGroup(body);
    } else {
      // Just an account; they can create or join a group later
      return await handleCreateAccount(body);
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
 * Handle self-registration without a group
 */
async function handleCreateAccount(body: unknown) {
  const data = accountSchema.parse(body);
  const hashedPassword = await hash(data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Create default notification preferences
    await tx.notificationPreference.create({
      data: { userId: user.id },
    });
  });

  return NextResponse.json(
    {
      message: 'Account created successfully',
      groupSlug: null,
      groupName: null,
    },
    { status: 201 }
  );
}

/**
 * Handle creating a new group with the user as GROUP_ADMIN
 */
async function handleCreateGroup(body: unknown) {
  const data = createGroupSchema.parse(body);

  const slug = await generateUniqueSlug(data.groupName);
  if (!slug) {
    return NextResponse.json(
      { error: 'A group with a similar name already exists. Please choose a different name.' },
      { status: 400 }
    );
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

    await addMembership(tx, user.id, group.id, 'GROUP_ADMIN');

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

  const inviteResult = await findUsableInvite(data.inviteToken);
  if ('error' in inviteResult) {
    return NextResponse.json({ error: inviteResult.error }, { status: 400 });
  }
  const { invite } = inviteResult;

  // If invite is email-specific, verify it matches
  if (invite.email && invite.email.toLowerCase() !== data.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'This invite is for a different email address' },
      { status: 400 }
    );
  }

  // Create user and join the group in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Hash password
    const hashedPassword = await hash(data.password, 12);

    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Adds the membership with the invite's role and sets it as the active group
    await acceptInvite(tx, user.id, invite);

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
