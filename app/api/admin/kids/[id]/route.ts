import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canManageGroupContent, isSuperAdmin } from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

const updateAssetSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['VERSE', 'ACTIVITY', 'COLORING']).optional(),
  description: z.string().optional(),
  isGlobal: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.kidsAsset.findUnique({
      where: { id: params.id },
      select: { groupId: true, isGlobal: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Admins can only change their own group's content; shared items are SUPER_ADMIN-only
    if (!(await canManageGroupContent(existing.groupId, existing.isGlobal))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateAssetSchema.parse(body);

    if (data.isGlobal !== undefined && !(await isSuperAdmin())) {
      return NextResponse.json(
        { error: 'Only super admins can share content with all groups' },
        { status: 403 }
      );
    }

    // Only update fields that were sent (a blank description clears it)
    const asset = await prisma.kidsAsset.update({
      where: { id: params.id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description === undefined ? undefined : data.description || null,
        isGlobal: data.isGlobal,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Asset update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user || session.user.role === 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the asset to find the file URL
    const asset = await prisma.kidsAsset.findUnique({
      where: { id: params.id },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Admins can only delete their own group's content; shared items are SUPER_ADMIN-only
    if (!(await canManageGroupContent(asset.groupId, asset.isGlobal))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract the file path from the URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/assets/kids-assets/filename.ext
    const supabase = getSupabaseClient();
    const url = new URL(asset.fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('assets') + 1).join('/');

    // Delete the file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('assets')
      .remove([filePath]);

    if (deleteError) {
      console.error('File deletion error:', deleteError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the database record
    await prisma.kidsAsset.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Asset deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
