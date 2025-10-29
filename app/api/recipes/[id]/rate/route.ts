import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = ratingSchema.parse(body);

    // Upsert rating
    const recipeRating = await prisma.recipeRating.upsert({
      where: {
        recipeId_userId: {
          recipeId: params.id,
          userId: session.user.id,
        },
      },
      create: {
        recipeId: params.id,
        userId: session.user.id,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
    });

    // Recalculate average
    const ratings = await prisma.recipeRating.findMany({
      where: { recipeId: params.id },
      select: { rating: true },
    });

    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await prisma.recipe.update({
      where: { id: params.id },
      data: {
        ratingAvg: avg,
        ratingCount: ratings.length,
      },
    });

    return NextResponse.json(recipeRating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Rating error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
