// app/layout.tsx
import './globals.css'; // Your global styles
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header'; // Assuming Header is in components/Header.tsx
import { cookies } from 'next/headers'; // Import the cookies function for server-side access
import { Toaster } from "@/components/ui/toaster" // Import Toaster if you use shadcn toasts

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // You can keep your original metadata or update it
  title: 'Quiz Admin Dashboard',
  description: 'Manage quizzes and resources',
};

export default function RootLayout({
  children,
}: Readonly<{ // Use Readonly<> for props type
  children: React.ReactNode;
}>) {

  // --- Authentication Check ---
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('auth_token');
  const isSignedIn = !!tokenCookie?.value;
  console.log(`[Layout Server Render] User signed in status: ${isSignedIn}`);
  // --- End Authentication Check ---

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Pass the determined status to the Header component */}
        <Header isSignedIn={isSignedIn} />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster /> {/* Add Toaster here for shadcn UI toasts */}
      </body>
    </html>
  );
}