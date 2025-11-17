import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * PATCH /api/user/profile
 * Update user profile (name, email, image)
 * - Email changes are restricted to admins only
 * - Supports file upload for profile images
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const imageFile = formData.get('image') as File | null;

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = currentUser.role === 'ADMIN';

    // Handle image upload if provided
    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        const supabase = getSupabaseClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, buffer, {
            contentType: imageFile.type,
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
          );
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
          { error: 'Failed to process image' },
          { status: 500 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      image?: string;
    } = {};

    // Always allow name and image updates
    if (name !== undefined && name !== null) {
      updateData.name = name;
    }

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    // Only allow email updates for admins
    if (email !== undefined && email !== currentUser.email) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only administrators can change email addresses' },
          { status: 403 }
        );
      }

      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
