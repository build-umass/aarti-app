// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import AppShell from '@/components/AppShell';
import { cookies } from 'next/headers';
import { Toaster } from '@/components/ui/toaster';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Aarti Admin',
  description: 'Manage Aarti quizzes and learning resources',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  const isSignedIn = !!tokenCookie?.value;

  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <AppShell isSignedIn={isSignedIn}>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
