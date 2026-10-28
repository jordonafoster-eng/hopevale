import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canViewGroupContent } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;

    const asset = await prisma.kidsAsset.findUnique({
      where: { id: params.id },
      select: { groupId: true, isGlobal: true },
    });
    if (!asset || (!asset.isGlobal && !(await canViewGroupContent(asset.groupId)))) {
      return NextResponse.json({ success: true });
    }

    // Increment download count
    await prisma.kidsAsset.update({
      where: { id: params.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download tracking error:', error);
    // Don't fail the download if tracking fails
    return NextResponse.json({ success: true });
  }
}
