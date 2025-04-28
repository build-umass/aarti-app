// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Use next/headers for App Router Route Handlers
import { encodeToken } from '@/lib/auth'; // Using jose-based async encodeToken
import bcrypt from 'bcrypt'; // Import bcrypt

// Read the STORED HASH from environment variables
const storedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

export async function POST(request: Request) {
  console.log('\n--- Login API POST Request Received ---');

  if (!storedPasswordHash) {
    console.error("ADMIN_PASSWORD_HASH environment variable is not set!");
    return NextResponse.json({ message: 'Server configuration error: Password hash missing.' }, { status: 500 });
  }

  try {
    const { password } = await request.json();

    if (!password) {
        console.log("Login attempt failed: No password provided.");
        return NextResponse.json({ message: 'Password is required.' }, { status: 400 });
    }

    console.log("Comparing submitted password with stored hash...");
    const passwordMatches = await bcrypt.compare(password, storedPasswordHash);
    console.log(`Password comparison result: ${passwordMatches}`);


    if (passwordMatches) {
      console.log("Password matches! Generating token...");
      // Password is correct
      const payload = { sub: 'admin_user', role: 'admin' as const };
      const token = await encodeToken(payload);

      console.log("Setting auth_token cookie...");
      cookies().set('auth_token', token, {
        httpOnly: true,                     // Prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // Use secure flag in production (HTTPS)
        path: '/',                          // Cookie accessible for all paths
        sameSite: 'strict',                 // Protect against CSRF
        maxAge: 60 * 60,                    // 1 hour expiration (matches token)
      });

      console.log("Login successful, returning success response.");
      return NextResponse.json({ success: true }, { status: 200 });

    } else {
      // Password does not match
      console.log('Login attempt failed: Invalid password.');
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 }); // Unauthorized
    }
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'An error occurred during login.' }, { status: 500 });
  }
}