import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const recipeSchema = z.object({
  title: z.string().min(3).max(100),
  ingredients: z.string().min(10).max(2000),
  steps: z.string().min(10).max(2000),
  imageUrl: z.string().url().nullable(),
  categories: z.array(z.string()).max(10),
  isPotluckHit: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = recipeSchema.parse(body);

    const recipe = await prisma.recipe.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Recipe creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
