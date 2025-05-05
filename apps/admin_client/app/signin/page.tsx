// app/signin/page.tsx
import SignInForm from '@/components/SignInForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  // Optional: Add logic here to redirect if already signed in, using middleware is often better though.
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Sign In</CardTitle>
          <CardDescription>Enter the password to access the admin area.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}