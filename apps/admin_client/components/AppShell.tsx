'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, HelpCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/resources', label: 'Resources', icon: BookOpen },
];

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-semibold text-primary-foreground shadow-sm">
        A
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight">Aarti</span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Admin
        </span>
      </span>
    </Link>
  );
}

export default function AppShell({
  isSignedIn,
  children,
}: {
  isSignedIn: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/signin');
        router.refresh();
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  if (pathname === '/signin') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-card px-4 py-6 md:flex">
        <BrandMark className="px-2" />

        {isSignedIn && (
          <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mt-auto pt-6">
          {isSignedIn && (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:hidden">
          <BrandMark />
          {isSignedIn && (
            <nav className="flex items-center gap-1" aria-label="Main">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-lg p-2 transition-colors ${
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-label="Sign out"
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </header>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
