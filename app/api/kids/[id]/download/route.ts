import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
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
