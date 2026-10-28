import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from './auth.config';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = await authConfig.callbacks.jwt(params);
      const { trigger, session } = params;

      if (trigger !== 'update') return token;

      // Never trust client-supplied role/group: reload them from the database
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, groupId: true, group: { select: { slug: true } } },
      });

      if (dbUser) {
        token.role = dbUser.role;
        token.groupId = dbUser.groupId;
        token.groupSlug = dbUser.group?.slug ?? null;
      }

      // Only SUPER_ADMIN may view a group other than their own
      if (token.role === 'SUPER_ADMIN' && session?.viewingGroupId !== undefined) {
        token.viewingGroupId = session.viewingGroupId;
      } else if (token.role !== 'SUPER_ADMIN') {
        token.viewingGroupId = undefined;
      }

      return token;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              group: {
                select: {
                  id: true,
                  slug: true,
                },
              },
            },
          });

          if (!user || !user.password) {
            return null;
          }

          // Check if user is blocked
          if (user.status === 'BLOCKED') {
            throw new Error('Your account has been blocked. Please contact an administrator.');
          }

          const isValid = await compare(password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            groupId: user.groupId,
            groupSlug: user.group?.slug ?? null,
          };
        } catch (error) {
          if (error instanceof Error && error.message.includes('blocked')) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
});
