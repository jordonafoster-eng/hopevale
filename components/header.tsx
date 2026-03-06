import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { MobileMenu } from './mobile-menu';
import { NotificationBell } from './notification-bell';
import { GroupSwitcher } from './group-switcher';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Prayer', href: '/prayer' },
  { name: 'Reflections', href: '/reflections' },
  { name: 'Recipes', href: '/recipes' },
  { name: 'Music', href: '/music' },
  { name: 'Kids', href: '/kids' },
];

export async function Header() {
  const session = await auth();

  // Get group info for display
  let groupName: string | null = null;
  let allGroups: { id: string; name: string }[] = [];

  if (session?.user?.groupId) {
    const group = await prisma.group.findUnique({
      where: { id: session.user.groupId },
      select: { name: true },
    });
    groupName = group?.name ?? null;
  }

  // For SUPER_ADMIN, fetch all groups for the switcher
  if (session?.user?.role === 'SUPER_ADMIN') {
    allGroups = await prisma.group.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  const isAdmin = session?.user?.role === 'GROUP_ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="HopeVale Community Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Church Friends
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Group Name Badge */}
            {session?.user && groupName && (
              <div className="hidden items-center md:flex">
                {session.user.role === 'SUPER_ADMIN' ? (
                  <GroupSwitcher
                    groups={allGroups}
                    currentGroupId={session.user.viewingGroupId ?? session.user.groupId}
                    currentGroupName={groupName}
                  />
                ) : (
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {groupName}
                  </span>
                )}
              </div>
            )}
            <ThemeToggle />
            {session?.user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950 md:block"
                  >
                    Admin
                  </Link>
                )}
                <NotificationBell />
                <UserMenu user={session.user} />
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-primary hidden md:inline-flex"
              >
                Sign In
              </Link>
            )}
            <MobileMenu navigation={navigation} session={session} isAdmin={isAdmin} groupName={groupName} />
          </div>
        </div>
      </nav>
    </header>
  );
}
