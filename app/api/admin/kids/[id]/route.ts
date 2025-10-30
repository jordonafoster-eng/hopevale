import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
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
});

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateAssetSchema.parse(body);

    const asset = await prisma.kidsAsset.update({
      where: { id: params.id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description || null,
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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the asset to find the file URL
    const asset = await prisma.kidsAsset.findUnique({
      where: { id: params.id },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
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
