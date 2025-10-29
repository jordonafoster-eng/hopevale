import Link from 'next/link';
import { auth } from '@/lib/auth';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { MobileMenu } from './mobile-menu';

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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Community Hub
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
            <ThemeToggle />
            {session?.user ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950 md:block"
                  >
                    Admin
                  </Link>
                )}
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
            <MobileMenu navigation={navigation} session={session} />
          </div>
        </div>
      </nav>
    </header>
  );
}
