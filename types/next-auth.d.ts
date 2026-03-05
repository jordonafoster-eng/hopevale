import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
    groupId: string | null;
    groupSlug: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
      email: string;
      name?: string | null;
      image?: string | null;
      groupId: string | null;
      groupSlug: string | null;
      viewingGroupId?: string | null; // For SUPER_ADMIN viewing specific group
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'MEMBER' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
    groupId: string | null;
    groupSlug: string | null;
    viewingGroupId?: string | null;
  }
}
