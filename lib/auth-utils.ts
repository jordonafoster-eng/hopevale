import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Re-export auth for convenience
export { auth };

/**
 * Get current session or redirect to sign in
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }
  return session;
}

/**
 * Require admin role or redirect to home
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }
  return session;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

/**
 * Get current user or null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
