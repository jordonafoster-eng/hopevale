import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const feedbackSchema = z.object({
  category: z.string().min(1),
  message: z.string().min(10).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const feedback = await prisma.feedback.create({
      data: {
        category: validatedData.category,
        message: validatedData.message,
        userId: session?.user?.id || null,
        status: 'NEW',
      },
    });

    // TODO: Send email notification to admin (requires Resend setup)

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Feedback creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
