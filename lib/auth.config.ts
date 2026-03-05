import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [], // Providers are added in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.groupId = user.groupId;
        token.groupSlug = user.groupSlug;
      }

      // Handle SUPER_ADMIN switching group view or other session updates
      if (trigger === 'update' && session) {
        if (session.viewingGroupId !== undefined) {
          token.viewingGroupId = session.viewingGroupId;
        }
        // Allow updating other fields as needed
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
        session.user.groupId = token.groupId as string | null;
        session.user.groupSlug = token.groupSlug as string | null;
        session.user.viewingGroupId = token.viewingGroupId as string | null | undefined;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public routes that don't require authentication
      const publicRoutes = [
        '/auth/signin',
        '/auth/signup',
        '/auth/error',
        '/auth/forgot-password',
        '/api/auth',
        '/privacy-policy',
      ];

      // Check if the current path is a public route
      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isAuthenticated && !isPublicRoute) {
        return false; // Redirect to signIn page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
