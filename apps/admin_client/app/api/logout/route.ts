// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('\n--- Logout API POST Request Received ---');
  try {
    console.log("Attempting to delete auth_token cookie...");
    // Clear the authentication cookie by setting its maxAge to 0 or expiry to the past
    (cookies() as any).set('auth_token', '', {
      path: '/',          // Path must match the path used when setting
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,          // Expire immediately
      // Alternatively: expires: new Date(0)
    });
    // Or using delete (ensure path matches if using delete)
    // cookies().delete('auth_token', { path: '/' });

    console.log('Logout successful: auth_token cookie cleared.');
    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during logout' }, { status: 500 });
  }
}