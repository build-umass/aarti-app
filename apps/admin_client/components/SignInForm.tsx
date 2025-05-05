// components/SignInForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react'; // Import Eye and EyeOff icons

export default function SignInForm() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log(`[SignInForm] Attempting login with password: "${password}"`);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        console.log("[SignInForm] Login successful, navigating and refreshing...");
        router.push('/quizzes');
        router.refresh();
      } else {
        const data = await response.json();
        console.error("[SignInForm] Login failed:", data.message);
        setError(data.message || 'Invalid password or login error.');
      }
    } catch (err) {
      console.error('[SignInForm] Network or other error during login:', err);
      setError('An network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        {/* Wrap Input and Button for positioning */}
        <div className="relative">
          <Input
            id="password"
            // Dynamically set input type based on showPassword state
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
            // Add padding to the right to make space for the button
            className="pr-10"
          />
          {/* Show/Hide Password Toggle Button */}
          <Button
            type="button" // Prevent form submission
            variant="ghost" // Use ghost variant for subtle appearance
            size="icon" // Make it icon-sized
            onClick={togglePasswordVisibility}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground" // Position button absolutely
            aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility label
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
}