'use client';

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          QuizAdmin
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            <NavigationMenuItem>
              <Link href="/quizzes" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium">
                  Quizzes
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/resources" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium">
                  Resources
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button variant="outline" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          Sign In
        </Button>
      </div>
    </header>
  );
}