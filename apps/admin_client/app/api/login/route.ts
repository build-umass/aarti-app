// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { encodeToken } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  console.log('\n--- Login API POST Request Received ---');

  // Read the HASH from environment variables
  let storedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  // Trim the environment variable for robustness
  if (typeof storedPasswordHash === 'string') {
    storedPasswordHash = storedPasswordHash.trim();
    console.log(`Trimmed storedPasswordHash from env: "${storedPasswordHash}"`); // Keep this log for sanity check
  } else {
    console.log("storedPasswordHash from env is not a string or is undefined");
  }

  // Check if the hash variable is actually set after potential trim
  if (!storedPasswordHash) {
    console.error("ADMIN_PASSWORD_HASH environment variable is not set or is empty!");
    return NextResponse.json({ message: 'Server configuration error: Password hash missing or empty.' }, { status: 500 });
  }

  try {
    const { password } = await request.json();

    if (!password) {
      console.log("Login attempt failed: No password provided.");
      return NextResponse.json({ message: 'Password is required.' }, { status: 400 });
    }

    console.log(`Comparing password "${password}" against stored hash (from env, trimmed)...`);
    // Use the trimmed storedPasswordHash
    const passwordMatches = await bcrypt.compare(password, storedPasswordHash);
    console.log(`Password comparison result (from env): ${passwordMatches}`);

    if (passwordMatches) {
      console.log("Password matches (from env)! Generating token...");
      const payload = { sub: 'admin_user', role: 'admin' as const };
      const token = await encodeToken(payload);

      // --- Use the NextResponse object pattern (Recommended for avoiding build issues) ---
      const response = NextResponse.json({ success: true }, { status: 200 });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 60 * 60,
      });
      console.log("Login successful, returning response with cookie.");
      return response;
      // --- End NextResponse pattern ---

    } else {
      // Password does not match
      console.log('Login attempt failed: Invalid password (compared against env hash).');
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'An error occurred during login.' }, { status: 500 });
  }
}