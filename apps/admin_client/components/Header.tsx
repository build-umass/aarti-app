// components/Header.tsx
'use client';

import { useState } from 'react';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn } from 'lucide-react'; // Use appropriate icons
import { useRouter } from 'next/navigation'; // Use App Router's router

interface HeaderProps {
  isSignedIn: boolean;
}

export default function Header({ isSignedIn }: HeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Attempting sign out...');

    try {
      const response = await fetch('/api/logout', { // Call the logout API
        method: 'POST',
      });

      if (response.ok) {
        console.log('Sign out successful via API.');
        router.push('/signin'); // Redirect to sign-in page
        router.refresh(); // IMPORTANT: Refresh server components state
      } else {
        const data = await response.json();
        console.error('Sign out failed:', data.message);
        setError(data.message || 'Sign out failed. Please try again.');
      }
    } catch (err) {
      console.error('Network or other error during sign out:', err);
      setError('An network error occurred during sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          QuizAdmin
        </Link>
        <NavigationMenu className="hidden sm:flex">
          <NavigationMenuList className="flex gap-6">
            <NavigationMenuItem>
              <Link href="/quizzes" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium hover:text-primary transition-colors">
                  Quizzes
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/resources" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium hover:text-primary transition-colors">
                  Resources
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Conditional Sign In / Sign Out Button */}
        {isSignedIn ? (
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </Button>
        ) : (
          <Link href="/signin" passHref legacyBehavior>
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
      {error && (
        <div className="container mx-auto px-4 pb-2">
          <p className="text-red-500 text-xs text-center">{error}</p>
        </div>
      )}
    </header>
  );
}