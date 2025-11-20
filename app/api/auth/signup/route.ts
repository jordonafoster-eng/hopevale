import { NextResponse } from 'next/server';

// Self-signup is disabled for this private community app.
// New members must be invited by an administrator.
// Admins can create users through the admin panel.

export async function POST() {
  return NextResponse.json(
    {
      error: 'Public registration is disabled. Please contact an administrator to request an invitation to this private community.'
    },
    { status: 403 }
  );
}
